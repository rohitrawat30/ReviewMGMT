import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { GenerateReviewDto } from './dto/generate-review.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';

export type SubmitReviewResult = {
  action: 'redirect' | 'connectCustomer';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'SKIPPED';
};

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);
  private readonly groq: Groq;
  private readonly modelName = 'llama-3.1-8b-instant';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GROQ_API_KEY');
    this.groq = new Groq({ apiKey });
  }

  // ─── API 1: Generate Review ────────────────────────────────────────────────

  async generateReview(dto: GenerateReviewDto): Promise<{ review: string }> {
    const { rating, keywords } = dto;
    const keywordList = keywords.join(', ');

    console.log('  [STEP 1] Inputs validated');
    console.log(`           Rating   → ${rating}`);
    console.log(`           Keywords → ${keywordList}`);

    const prompt = `You are helping a customer write a short Google review for a business.
The customer rated the business ${rating} out of 5 stars and highlighted these aspects: ${keywordList}.

Write a genuine, human-sounding Google review in 2–3 sentences.
Requirements:
- Naturally incorporate the highlighted keywords
- Match the tone to the star rating (${rating}/5)
- Sound like a real person wrote it, not AI
- Be concise and specific
- Vary the sentence structure slightly to feel fresh
- Do NOT use any asterisks, markdown, or formatting — plain text only

Return only the review text, nothing else.`;

    console.log('  [STEP 2] Sending prompt to Groq AI (llama-3.1-8b-instant)...');

    try {
      const completion = await this.groq.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 150,
      });

      const review = completion.choices[0]?.message?.content?.trim() ?? '';

      console.log('  [STEP 3] Groq AI responded successfully');
      console.log(`           Generated → "${review}"`);
      console.log('  [STEP 4] Sending response to client');

      return { review };
    } catch (error) {
      console.error('  [ERROR]  Groq AI call failed');
      console.error(`           Reason → ${error.message}`);
      this.logger.error('Failed to generate review via Groq API', error);
      throw new InternalServerErrorException('Failed to generate review. Please try again.');
    }
  }

  // ─── API 2: Submit Review ─────────────────────────────────────────────────

  async submitReview(dto: SubmitReviewDto): Promise<SubmitReviewResult> {
    const { rating, comment } = dto;

    console.log('  [STEP 1] Inputs validated');
    console.log(`           Rating  → ${rating}`);
    console.log(`           Comment → "${comment}"`);

    // Step 2: Rating check
    console.log('  [STEP 2] Checking rating...');
    if (rating <= 3) {
      console.log(`           Rating ${rating} is LOW (1–3)`);
      console.log('           Skipping sentiment analysis');
      console.log('           Action → connectCustomer | Sentiment → SKIPPED');
      console.log('  [STEP 3] Sending response to client');
      return { action: 'connectCustomer', sentiment: 'SKIPPED' };
    }

    console.log(`           Rating ${rating} is HIGH (4–5) → proceeding to sentiment check`);

    // Step 3: Sentiment analysis
    console.log('  [STEP 3] Sending comment to Groq AI for sentiment analysis...');
    const sentiment = await this.analyzeSentiment(comment);

    // Step 4: Decision
    console.log('  [STEP 4] Making routing decision...');
    const action = sentiment === 'POSITIVE' ? 'redirect' : 'connectCustomer';

    if (action === 'redirect') {
      console.log('           Sentiment is POSITIVE + Rating is HIGH');
      console.log('           Action → redirect (send user to Google Review page)');
    } else {
      console.log('           Sentiment is NEGATIVE despite high rating');
      console.log('           Action → connectCustomer (handle internally)');
    }

    console.log('  [STEP 5] Sending response to client');
    return { action, sentiment };
  }

  // ─── Sentiment Analysis (internal) ────────────────────────────────────────

  private async analyzeSentiment(comment: string): Promise<'POSITIVE' | 'NEGATIVE'> {
    const prompt = `Analyze the sentiment of the following customer review comment.
Reply with ONLY one word: either POSITIVE or NEGATIVE.

Comment: "${comment}"`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 5,
      });

      const rawResponse = completion.choices[0]?.message?.content?.trim() ?? '';
      const sentiment = rawResponse.toUpperCase().includes('NEGATIVE') ? 'NEGATIVE' : 'POSITIVE';

      console.log('           Groq AI responded for sentiment');
      console.log(`           Raw response → "${rawResponse}"`);
      console.log(`           Parsed       → ${sentiment}`);

      return sentiment;
    } catch (error) {
      console.error('  [ERROR]  Sentiment analysis failed — defaulting to POSITIVE');
      console.error(`           Reason → ${error.message}`);
      this.logger.error('Sentiment analysis failed', error);
      return 'POSITIVE';
    }
  }
}
