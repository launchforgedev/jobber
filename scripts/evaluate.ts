#!/usr/bin/env tsx
/**
 * Mandatory Batch Entry Point for Trao AI Interview Prep Kit
 * Strictly implements Section 9 & Appendix B:
 * Usage: npm run evaluate -- --input <cases.json> --output <kits.json>
 */

import * as fs from 'fs';
import * as path from 'path';
import { BatchInputCase, BatchOutput, BatchOutputItem } from '../src/types/prepkit.ts';
import { generateFullPrepKit } from '../src/services/aiGenerator.ts';

// Parse command line arguments
function parseArgs(): { inputPath: string; outputPath: string } {
  const args = process.argv.slice(2);
  let inputPath = 'cases.json';
  let outputPath = 'kits.json';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--input' || arg === '-i') {
      inputPath = args[i + 1] || inputPath;
      i++;
    } else if (arg === '--output' || arg === '-o') {
      outputPath = args[i + 1] || outputPath;
      i++;
    }
  }

  return { inputPath, outputPath };
}

async function runBatch() {
  const { inputPath, outputPath } = parseArgs();
  console.log(`\n========================================`);
  console.log(`Trao Assessment: Running Batch Evaluation`);
  console.log(`Input cases:  ${inputPath}`);
  console.log(`Output destination: ${outputPath}`);
  console.log(`========================================\n`);

  const resolvedInput = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolvedInput)) {
    console.error(`Error: Input file does not exist at "${resolvedInput}"`);
    process.exit(1);
  }

  let rawContent = '';
  try {
    rawContent = fs.readFileSync(resolvedInput, 'utf-8');
  } catch (err: any) {
    console.error(`Failed to read input file: ${err?.message}`);
    process.exit(1);
  }

  let cases: BatchInputCase[] = [];
  try {
    cases = JSON.parse(rawContent);
    if (!Array.isArray(cases)) {
      throw new Error('Input file must contain a JSON array of cases.');
    }
  } catch (err: any) {
    console.error(`Failed to parse input cases JSON: ${err?.message}`);
    process.exit(1);
  }

  console.log(`Loaded ${cases.length} case(s) to process.\n`);

  const outputKits: BatchOutputItem[] = [];

  for (let idx = 0; idx < cases.length; idx++) {
    const c = cases[idx];
    console.log(`[${idx + 1}/${cases.length}] Processing case id="${c.id}" (${c.company_url}, ${c.days} days)...`);

    try {
      if (!c.jd || typeof c.jd !== 'string') {
        throw new Error('Case missing valid "jd" string');
      }

      const days = typeof c.days === 'number' && c.days > 0 ? c.days : 5;
      const kit = await generateFullPrepKit(c.jd, c.company_url || '', days, progress => {
        // Quiet or minimal log
        process.stdout.write(`   [${progress.step}] ${progress.message}\r`);
      });

      console.log(`\n   ✓ Completed case "${c.id}" successfully.`);
      outputKits.push({
        id: c.id,
        status: 'ok',
        kit,
        error: null
      });
    } catch (err: any) {
      console.error(`\n   ✗ Failed case "${c.id}": ${err?.message || err}`);
      outputKits.push({
        id: c.id,
        status: 'failed',
        kit: null,
        error: {
          code: 'PIPELINE_ERROR',
          message: err?.message || 'Unexpected failure during pipeline execution'
        }
      });
    }
  }

  const batchOutput: BatchOutput = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    kits: outputKits
  };

  const resolvedOutput = path.resolve(process.cwd(), outputPath);
  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
  fs.writeFileSync(resolvedOutput, JSON.stringify(batchOutput, null, 2), 'utf-8');

  console.log(`\n========================================`);
  console.log(`Batch evaluation complete!`);
  console.log(`Wrote ${outputKits.length} result(s) to: ${resolvedOutput}`);
  console.log(`Successful: ${outputKits.filter(k => k.status === 'ok').length}`);
  console.log(`Failed:     ${outputKits.filter(k => k.status === 'failed').length}`);
  console.log(`========================================\n`);
}

runBatch().catch(err => {
  console.error('Fatal batch runner error:', err);
  process.exit(1);
});
