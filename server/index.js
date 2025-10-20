import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import { OpenAI } from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const DATA_PATH = path.join(process.cwd(), 'server', 'events.json');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function loadEvents() {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  return data.events || [];
}

function saveEvents(events) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ events }, null, 2));
}

// --- AI-powered summarizer ---
async function summarizeEventData(text) {
  try {
    const prompt = `Extract a clean event listing (name, date, org, desc, link, venue) from this data: ${text}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error('AI summarization error:', err);
    return null;
  }
}

// --- Scraper sources ---
const SOURCES = [
  'https://www.calendar.virginia.edu/',
  'https://news.virginia.edu/',
  'https://www.visitcharlottesville.org/events/',
];

async function scrapeEvents() {
  const events = [];
  for (const url of SOURCES) {
    try {
      const { data } = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(data);

      $('a:contains(event), a:contains(Event), a[href*="event"]').each((_, el) => {
        const text = $(el).text().trim();
        const link = $(el).attr('href');
        if (text && link) {
          events.push({
            name: text,
            url: link.startsWith('http') ? link : url + link,
            source: url,
          });
        }
      });
    } catch (err) {
      console.error(`Error fetching ${url}:`, err.message);
    }
  }
  return events;
}

// --- Combined puller ---
app.get('/api/events/refresh', async (req, res) => {
  try {
    const scraped = await scrapeEvents();
    const aiEnhanced = [];

    for (const e of scraped.slice(0, 10)) {
      const summary = await summarizeEventData(`${e.name}\n${e.url}`);
      aiEnhanced.push({ ...e, summary });
    }

    saveEvents(aiEnhanced);
    res.json({ success: true, count: aiEnhanced.length, events: aiEnhanced });
  } catch (e) {
    console.error('Refresh error:', e);
    res.status(500).json({ error: 'Failed to refresh events' });
  }
});

app.get('/api/events', (req, res) => {
  const events = loadEvents();
  res.json({ events });
});

app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
