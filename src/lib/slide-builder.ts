/**
 * PptxGenJS slide builder.
 *
 * Builds a richly-formatted .pptx presentation from structured SlideData
 * using the selected design template's style properties (titleLayout,
 * bulletIcon, decorations).
 */

import PptxGenJS from 'pptxgenjs';
import type { Slide as SlideItem, SlideData, Template } from '@/types';
import { getTemplate } from './templates';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLIDE_W = 10;
const SLIDE_H = 5.625;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip leading '#' from hex colour strings for PptxGenJS compatibility. */
function hex(color: string): string {
  return color.replace(/^#/, '');
}

/** Return the bullet prefix string for a given icon style and index. */
function bulletPrefix(
  icon: Template['style']['bulletIcon'],
  index: number,
): string {
  switch (icon) {
    case 'circle':
      return '\u25CF  ';
    case 'arrow':
      return '\u25B6  ';
    case 'check':
      return '\u2713  ';
    case 'dash':
      return '\u2014  ';
    case 'number':
      return `${index + 1}.  `;
    case 'diamond':
      return '\u25C6  ';
    default:
      return '\u25CF  ';
  }
}

// ---------------------------------------------------------------------------
// Decorations
// ---------------------------------------------------------------------------

/** Apply all decorations specified in `template.style.decorations` to a slide. */
function applyDecorations(slide: PptxGenJS.Slide, template: Template): void {
  const decs = template.style.decorations;

  for (const dec of decs) {
    switch (dec) {
      case 'sidebar':
        slide.addShape('rect', {
          x: 0,
          y: 0,
          w: 0.15,
          h: SLIDE_H,
          fill: { color: hex(template.colors.primary) },
        });
        break;

      case 'corner-circle':
        slide.addShape('ellipse', {
          x: SLIDE_W - 1.2,
          y: SLIDE_H - 1.2,
          w: 1.4,
          h: 1.4,
          fill: { color: hex(template.colors.accent), transparency: 85 },
        });
        break;

      case 'top-gradient':
        slide.addShape('rect', {
          x: 0,
          y: 0,
          w: SLIDE_W,
          h: 0.5,
          fill: { color: hex(template.colors.primary) },
        });
        break;

      case 'bottom-line':
        slide.addShape('rect', {
          x: 0,
          y: SLIDE_H - 0.06,
          w: SLIDE_W,
          h: 0.06,
          fill: { color: hex(template.colors.accent) },
        });
        break;

      case 'diagonal-stripe':
        slide.addShape('rect', {
          x: 7.5,
          y: -1.0,
          w: 4.0,
          h: 1.6,
          fill: { color: hex(template.colors.primary), transparency: 75 },
          rotate: 25,
        });
        break;

      case 'dot-pattern':
        // 4 small decorative circles in top-right corner area
        slide.addShape('ellipse', {
          x: 9.0,
          y: 0.2,
          w: 0.12,
          h: 0.12,
          fill: { color: hex(template.colors.accent), transparency: 50 },
        });
        slide.addShape('ellipse', {
          x: 9.25,
          y: 0.2,
          w: 0.12,
          h: 0.12,
          fill: { color: hex(template.colors.accent), transparency: 50 },
        });
        slide.addShape('ellipse', {
          x: 9.0,
          y: 0.45,
          w: 0.12,
          h: 0.12,
          fill: { color: hex(template.colors.accent), transparency: 50 },
        });
        slide.addShape('ellipse', {
          x: 9.25,
          y: 0.45,
          w: 0.12,
          h: 0.12,
          fill: { color: hex(template.colors.accent), transparency: 50 },
        });
        break;
    }
  }
}

// ---------------------------------------------------------------------------
// Title slide layouts
// ---------------------------------------------------------------------------

function buildTitleSlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  const layout = template.style.titleLayout;

  switch (layout) {
    case 'center': {
      slide.background = { color: hex(template.colors.primary) };

      slide.addText(item.title, {
        x: 0.5,
        y: 1.2,
        w: 9.0,
        h: 2.0,
        fontSize: 28,
        fontFace: template.fonts.title,
        color: 'FFFFFF',
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      if (item.subtitle) {
        slide.addText(item.subtitle, {
          x: 1.0,
          y: 3.4,
          w: 8.0,
          h: 0.8,
          fontSize: 16,
          fontFace: template.fonts.body,
          color: hex(template.colors.accent),
          align: 'center',
          valign: 'middle',
        });
      }

      // Decorative accent line
      slide.addShape('rect', {
        x: 3.5,
        y: 4.4,
        w: 3.0,
        h: 0.05,
        fill: { color: hex(template.colors.accent) },
      });
      break;
    }

    case 'left-bold': {
      slide.background = { color: hex(template.colors.background) };

      // Coloured left bar
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: 0.25,
        h: SLIDE_H,
        fill: { color: hex(template.colors.primary) },
      });

      slide.addText(item.title, {
        x: 0.6,
        y: 1.0,
        w: 8.5,
        h: 2.2,
        fontSize: 28,
        fontFace: template.fonts.title,
        color: hex(template.colors.titleText),
        bold: true,
        align: 'left',
        valign: 'middle',
      });

      if (item.subtitle) {
        slide.addText(item.subtitle, {
          x: 0.6,
          y: 3.3,
          w: 8.5,
          h: 0.8,
          fontSize: 16,
          fontFace: template.fonts.body,
          color: hex(template.colors.text),
          align: 'left',
          valign: 'middle',
        });
      }

      // Accent line under subtitle area
      slide.addShape('rect', {
        x: 0.6,
        y: 4.3,
        w: 2.5,
        h: 0.05,
        fill: { color: hex(template.colors.accent) },
      });
      break;
    }

    case 'split': {
      // Left half: coloured background with title
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: SLIDE_W / 2,
        h: SLIDE_H,
        fill: { color: hex(template.colors.primary) },
      });

      slide.addText(item.title, {
        x: 0.4,
        y: 1.0,
        w: 4.2,
        h: 3.0,
        fontSize: 28,
        fontFace: template.fonts.title,
        color: 'FFFFFF',
        bold: true,
        align: 'left',
        valign: 'middle',
      });

      // Right half: subtitle
      if (item.subtitle) {
        slide.addText(item.subtitle, {
          x: 5.4,
          y: 1.5,
          w: 4.0,
          h: 2.5,
          fontSize: 16,
          fontFace: template.fonts.body,
          color: hex(template.colors.text),
          align: 'left',
          valign: 'middle',
        });
      }
      break;
    }

    case 'bottom-bar': {
      slide.background = { color: hex(template.colors.background) };

      slide.addText(item.title, {
        x: 0.5,
        y: 2.5,
        w: 9.0,
        h: 1.5,
        fontSize: 28,
        fontFace: template.fonts.title,
        color: hex(template.colors.titleText),
        bold: true,
        align: 'left',
        valign: 'bottom',
      });

      // Thick coloured bar underneath
      slide.addShape('rect', {
        x: 0.5,
        y: 4.2,
        w: 9.0,
        h: 0.18,
        fill: { color: hex(template.colors.primary) },
      });

      if (item.subtitle) {
        slide.addText(item.subtitle, {
          x: 0.5,
          y: 4.5,
          w: 9.0,
          h: 0.7,
          fontSize: 14,
          fontFace: template.fonts.body,
          color: hex(template.colors.text),
          align: 'left',
          valign: 'top',
        });
      }
      break;
    }

    case 'diagonal': {
      slide.background = { color: hex(template.colors.background) };

      // Diagonal coloured shape behind title
      slide.addShape('rect', {
        x: -1.0,
        y: 0.5,
        w: 8.0,
        h: 4.0,
        fill: { color: hex(template.colors.primary), transparency: 80 },
        rotate: -8,
      });

      slide.addText(item.title, {
        x: 0.8,
        y: 1.2,
        w: 8.4,
        h: 2.0,
        fontSize: 28,
        fontFace: template.fonts.title,
        color: hex(template.colors.titleText),
        bold: true,
        align: 'left',
        valign: 'middle',
      });

      if (item.subtitle) {
        slide.addText(item.subtitle, {
          x: 0.8,
          y: 3.4,
          w: 8.4,
          h: 0.8,
          fontSize: 16,
          fontFace: template.fonts.body,
          color: hex(template.colors.text),
          align: 'left',
          valign: 'middle',
        });
      }
      break;
    }

    case 'overlay': {
      // Full coloured background
      slide.background = { color: hex(template.colors.primary) };

      // Semi-transparent overlay box
      slide.addShape('rect', {
        x: 1.0,
        y: 1.0,
        w: 8.0,
        h: 3.5,
        fill: { color: 'FFFFFF', transparency: 80 },
        rectRadius: 0.1,
      });

      slide.addText(item.title, {
        x: 1.5,
        y: 1.2,
        w: 7.0,
        h: 2.0,
        fontSize: 28,
        fontFace: template.fonts.title,
        color: 'FFFFFF',
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      if (item.subtitle) {
        slide.addText(item.subtitle, {
          x: 1.5,
          y: 3.2,
          w: 7.0,
          h: 0.8,
          fontSize: 16,
          fontFace: template.fonts.body,
          color: hex(template.colors.accent),
          align: 'center',
          valign: 'middle',
        });
      }
      break;
    }
  }

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// TOC slide
// ---------------------------------------------------------------------------

function buildTocSlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(template.colors.background) };
  applyDecorations(slide, template);

  slide.addText(item.title || 'Table of Contents', {
    x: 0.5,
    y: 0.6,
    w: 9.0,
    h: 0.6,
    fontSize: 28,
    fontFace: template.fonts.title,
    color: hex(template.colors.titleText),
    bold: true,
  });

  const bullets = item.bullets ?? [];
  const textItems: PptxGenJS.TextProps[] = bullets.map((bullet, idx) => ({
    text: `${idx + 1}.  ${bullet}`,
    options: {
      fontSize: 14,
      fontFace: template.fonts.body,
      color: hex(template.colors.text),
      bullet: false as const,
      lineSpacing: 28,
      paraSpaceBefore: 4,
    },
  }));

  slide.addText(textItems, {
    x: 1.0,
    y: 1.5,
    w: 8.0,
    h: 3.5,
    valign: 'top',
  });

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Section slide
// ---------------------------------------------------------------------------

function buildSectionSlide(
  _pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = _pptx.addSlide();
  slide.background = { color: hex(template.colors.secondary) };

  slide.addText(item.title, {
    x: 0.5,
    y: 1.5,
    w: 9.0,
    h: 2.5,
    fontSize: 28,
    fontFace: template.fonts.title,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  // Decorative line beneath title
  slide.addShape('rect', {
    x: 3.0,
    y: 4.2,
    w: 4.0,
    h: 0.05,
    fill: { color: hex(template.colors.accent) },
  });

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Content slide
// ---------------------------------------------------------------------------

function buildContentSlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(template.colors.background) };
  applyDecorations(slide, template);

  // Offset title when sidebar decoration is present
  const hasBar = template.style.decorations.includes('sidebar');
  const leftPad = hasBar ? 0.4 : 0.5;

  slide.addText(item.title, {
    x: leftPad,
    y: 0.6,
    w: 9.0 - leftPad,
    h: 0.6,
    fontSize: 28,
    fontFace: template.fonts.title,
    color: hex(template.colors.titleText),
    bold: true,
  });

  slide.addText(item.content ?? '', {
    x: leftPad,
    y: 1.5,
    w: 9.0 - leftPad,
    h: 3.5,
    fontSize: 13,
    fontFace: template.fonts.body,
    color: hex(template.colors.text),
    valign: 'top',
    lineSpacing: 24,
    paraSpaceAfter: 6,
  });

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Bullets slide (card style)
// ---------------------------------------------------------------------------

function buildBulletsSlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(template.colors.background) };
  applyDecorations(slide, template);

  const hasBar = template.style.decorations.includes('sidebar');
  const leftPad = hasBar ? 0.4 : 0.5;

  slide.addText(item.title, {
    x: leftPad,
    y: 0.6,
    w: 9.0 - leftPad,
    h: 0.6,
    fontSize: 28,
    fontFace: template.fonts.title,
    color: hex(template.colors.titleText),
    bold: true,
  });

  const bullets = item.bullets ?? [];
  const maxVisible = 6;
  const visibleBullets = bullets.slice(0, maxVisible);
  const cardCount = visibleBullets.length || 1;

  // Layout calculations for card-style bullets
  const contentTop = 1.5;
  const contentHeight = SLIDE_H - contentTop - 0.4;
  const cardSpacing = 0.1;
  const totalSpacing = cardSpacing * (cardCount - 1);
  const cardH = Math.min(
    (contentHeight - totalSpacing) / cardCount,
    0.7,
  );
  const cardX = leftPad + 0.1;
  const cardW = SLIDE_W - cardX - 0.6;

  visibleBullets.forEach((bullet, idx) => {
    const cardY = contentTop + idx * (cardH + cardSpacing);

    // Card background (light tint, 90% transparency)
    slide.addShape('rect', {
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: hex(template.colors.accent), transparency: 90 },
      rectRadius: 0.05,
    });

    // Bullet text
    const prefix = bulletPrefix(template.style.bulletIcon, idx);
    slide.addText(`${prefix}${bullet}`, {
      x: cardX + 0.2,
      y: cardY,
      w: cardW - 0.4,
      h: cardH,
      fontSize: 14,
      fontFace: template.fonts.body,
      color: hex(template.colors.text),
      valign: 'middle',
    });
  });

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Data (table) slide
// ---------------------------------------------------------------------------

function buildDataSlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(template.colors.background) };
  applyDecorations(slide, template);

  slide.addText(item.title, {
    x: 0.5,
    y: 0.6,
    w: 9.0,
    h: 0.6,
    fontSize: 28,
    fontFace: template.fonts.title,
    color: hex(template.colors.titleText),
    bold: true,
  });

  if (!item.data) {
    if (item.notes) slide.addNotes(item.notes);
    return;
  }

  const { headers, rows } = item.data;
  const colCount = headers.length || 1;
  const colW = 8.5 / colCount;

  const headerRow: PptxGenJS.TableCell[] = headers.map((h) => ({
    text: h,
    options: {
      bold: true,
      fontSize: 13,
      fontFace: template.fonts.body,
      color: 'FFFFFF',
      fill: { color: hex(template.colors.primary) },
      align: 'center' as const,
      valign: 'middle' as const,
    },
  }));

  const dataRows: PptxGenJS.TableRow[] = rows.map((row, rowIdx) =>
    row.map((cell) => ({
      text: cell,
      options: {
        fontSize: 12,
        fontFace: template.fonts.body,
        color: hex(template.colors.text),
        fill: {
          color:
            rowIdx % 2 === 0
              ? hex(template.colors.background)
              : 'F7F7F7',
        },
        align: 'center' as const,
        valign: 'middle' as const,
      },
    })),
  );

  const tableRows: PptxGenJS.TableRow[] = [headerRow, ...dataRows];

  slide.addTable(tableRows, {
    x: 0.75,
    y: 1.5,
    w: 8.5,
    colW,
    border: { type: 'solid', pt: 0.5, color: hex(template.colors.accent) },
    rowH: 0.45,
    autoPage: true,
  });

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Comparison slide
// ---------------------------------------------------------------------------

function buildComparisonSlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(template.colors.background) };
  applyDecorations(slide, template);

  slide.addText(item.title, {
    x: 0.5,
    y: 0.6,
    w: 9.0,
    h: 0.6,
    fontSize: 28,
    fontFace: template.fonts.title,
    color: hex(template.colors.titleText),
    bold: true,
  });

  if (!item.columns) {
    if (item.notes) slide.addNotes(item.notes);
    return;
  }

  const { left, right } = item.columns;

  // --- Left column ---
  slide.addShape('rect', {
    x: 0.4,
    y: 1.4,
    w: 4.3,
    h: 0.5,
    fill: { color: hex(template.colors.primary) },
    rectRadius: 0.05,
  });
  slide.addText(left.title, {
    x: 0.4,
    y: 1.4,
    w: 4.3,
    h: 0.5,
    fontSize: 14,
    fontFace: template.fonts.title,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const leftBullets: PptxGenJS.TextProps[] = left.bullets.map((b, i) => ({
    text: `${bulletPrefix(template.style.bulletIcon, i)}${b}`,
    options: {
      fontSize: 13,
      fontFace: template.fonts.body,
      color: hex(template.colors.text),
      lineSpacing: 24,
      paraSpaceBefore: 4,
    },
  }));
  slide.addText(leftBullets, {
    x: 0.6,
    y: 2.05,
    w: 3.9,
    h: 3.0,
    valign: 'top',
  });

  // --- Right column ---
  slide.addShape('rect', {
    x: 5.3,
    y: 1.4,
    w: 4.3,
    h: 0.5,
    fill: { color: hex(template.colors.secondary) },
    rectRadius: 0.05,
  });
  slide.addText(right.title, {
    x: 5.3,
    y: 1.4,
    w: 4.3,
    h: 0.5,
    fontSize: 14,
    fontFace: template.fonts.title,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const rightBullets: PptxGenJS.TextProps[] = right.bullets.map((b, i) => ({
    text: `${bulletPrefix(template.style.bulletIcon, i)}${b}`,
    options: {
      fontSize: 13,
      fontFace: template.fonts.body,
      color: hex(template.colors.text),
      lineSpacing: 24,
      paraSpaceBefore: 4,
    },
  }));
  slide.addText(rightBullets, {
    x: 5.5,
    y: 2.05,
    w: 3.9,
    h: 3.0,
    valign: 'top',
  });

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Chart slide
// ---------------------------------------------------------------------------

function buildChartSlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(template.colors.background) };
  applyDecorations(slide, template);

  slide.addText(item.title, {
    x: 0.5,
    y: 0.6,
    w: 9.0,
    h: 0.5,
    fontSize: 22,
    fontFace: template.fonts.title,
    color: hex(template.colors.titleText),
    bold: true,
  });

  const chartData = item.chart;
  if (chartData && chartData.labels && chartData.datasets) {
    const chartTypeMap: Record<string, PptxGenJS.CHART_NAME> = {
      bar: pptx.ChartType.bar,
      pie: pptx.ChartType.pie,
      line: pptx.ChartType.line,
      doughnut: pptx.ChartType.doughnut,
    };

    const pptxChartType = chartTypeMap[chartData.type] || pptx.ChartType.bar;

    const data = chartData.datasets.map((ds) => ({
      name: ds.name,
      labels: chartData.labels,
      values: ds.values,
    }));

    const chartColors = [
      hex(template.colors.primary),
      hex(template.colors.secondary),
      hex(template.colors.accent),
      'FF6384',
      '36A2EB',
      'FFCE56',
      '4BC0C0',
      '9966FF',
    ];

    slide.addChart(pptxChartType, data, {
      x: 0.8,
      y: 1.3,
      w: 8.4,
      h: 4.0,
      showTitle: !!chartData.title,
      title: chartData.title || '',
      titleColor: hex(template.colors.text),
      titleFontSize: 11,
      showValue: chartData.type === 'pie' || chartData.type === 'doughnut',
      showPercent: chartData.type === 'pie' || chartData.type === 'doughnut',
      showLegend: true,
      legendPos: 'b',
      legendColor: hex(template.colors.text),
      chartColors,
      valAxisLabelColor: hex(template.colors.text),
      catAxisLabelColor: hex(template.colors.text),
      dataLabelColor: hex(template.colors.text),
    });
  } else {
    slide.addText('\u30B0\u30E9\u30D5\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093', {
      x: 1,
      y: 2.5,
      w: 8,
      h: 1,
      fontSize: 14,
      color: hex(template.colors.text),
      align: 'center',
    });
  }

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Quote slide
// ---------------------------------------------------------------------------

function buildQuoteSlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(template.colors.background) };
  applyDecorations(slide, template);

  const quoteText = item.quote?.text ?? item.content ?? '';
  const quoteAuthor = item.quote?.author ?? '';

  // Opening quotation mark
  slide.addText('\u201C', {
    x: 1.0,
    y: 0.8,
    w: 1.0,
    h: 1.0,
    fontSize: 60,
    fontFace: template.fonts.title,
    color: hex(template.colors.accent),
    bold: true,
  });

  // Quote body
  slide.addText(quoteText, {
    x: 1.2,
    y: 1.5,
    w: 7.6,
    h: 2.5,
    fontSize: 18,
    fontFace: template.fonts.body,
    color: hex(template.colors.text),
    italic: true,
    align: 'center',
    valign: 'middle',
    lineSpacing: 28,
  });

  // Author attribution
  if (quoteAuthor) {
    slide.addText(`\u2014 ${quoteAuthor}`, {
      x: 1.2,
      y: 4.1,
      w: 7.6,
      h: 0.6,
      fontSize: 14,
      fontFace: template.fonts.body,
      color: hex(template.colors.secondary),
      align: 'right',
      valign: 'middle',
    });
  }

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Summary slide
// ---------------------------------------------------------------------------

function buildSummarySlide(
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(template.colors.background) };
  applyDecorations(slide, template);

  slide.addText(item.title || 'Summary', {
    x: 0.5,
    y: 0.6,
    w: 9.0,
    h: 0.6,
    fontSize: 28,
    fontFace: template.fonts.title,
    color: hex(template.colors.titleText),
    bold: true,
  });

  const bullets = item.bullets ?? [];
  const textItems: PptxGenJS.TextProps[] = bullets.map((bullet, idx) => ({
    text: `${bulletPrefix(template.style.bulletIcon, idx)}${bullet}`,
    options: {
      fontSize: 14,
      fontFace: template.fonts.body,
      color: hex(template.colors.text),
      lineSpacing: 26,
      paraSpaceBefore: 6,
    },
  }));

  slide.addText(textItems, {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    h: 3.6,
    valign: 'top',
  });

  if (item.notes) slide.addNotes(item.notes);
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

type SlideBuilderFn = (
  pptx: PptxGenJS,
  item: SlideItem,
  template: Template,
) => void;

const SLIDE_BUILDERS: Record<string, SlideBuilderFn> = {
  title: buildTitleSlide,
  toc: buildTocSlide,
  section: buildSectionSlide,
  content: buildContentSlide,
  bullets: buildBulletsSlide,
  data: buildDataSlide,
  comparison: buildComparisonSlide,
  chart: buildChartSlide,
  quote: buildQuoteSlide,
  summary: buildSummarySlide,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a PowerPoint presentation from structured slide data and a template id.
 *
 * @param slideData - The AI-generated slide structure.
 * @param templateId - One of the six template identifiers.
 * @returns A Node.js Buffer containing the .pptx binary.
 */
export async function buildPptx(
  slideData: SlideData,
  templateId: string,
): Promise<Buffer> {
  const template = getTemplate(templateId);
  const pptx = new PptxGenJS();

  // Widescreen 16:9
  pptx.layout = 'LAYOUT_16x9';

  // Metadata
  pptx.author = 'Auto Slide Generator';
  pptx.subject = 'AI Generated Presentation';

  // Use title slide text as presentation title when available
  const titleSlide = slideData.slides.find((s) => s.type === 'title');
  if (titleSlide) {
    pptx.title = titleSlide.title;
  }

  // Theme fonts
  pptx.theme = {
    headFontFace: template.fonts.title,
    bodyFontFace: template.fonts.body,
  };

  // Build each slide
  for (const item of slideData.slides) {
    const builder = SLIDE_BUILDERS[item.type];
    if (builder) {
      builder(pptx, item, template);
    } else {
      // Fallback: treat unknown types as content slides
      buildContentSlide(pptx, item, template);
    }
  }

  // Export as Node buffer
  const output = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.from(output as ArrayBuffer);
}
