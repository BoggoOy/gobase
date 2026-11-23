// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import { describe, expect, test } from 'vitest'

import { formatMessage } from './GoBase.messages'
import { countryName, formatRatio, toLogsBarChartData, usageRatio } from './GoBase.utils'

describe('formatRatio', () => {
  test('formats ratios as percentages', () => {
    expect(formatRatio(0.9934, 'en')).toBe('99.34%')
    expect(formatRatio(0.75, 'en')).toBe('75%')
    expect(formatRatio(1, 'en')).toBe('100%')
    expect(formatRatio(0, 'en')).toBe('0%')
  })

  test('never rounds a ratio below 1 up to 100%', () => {
    expect(formatRatio(0.99987, 'en')).toBe('99.98%')
    expect(formatRatio(0.999999, 'en')).toBe('99.99%')
    expect(formatRatio(0.98765, 'en')).toBe('98.7%')
  })
})

describe('usageRatio', () => {
  test('clamps the ratio between 0 and 1', () => {
    expect(usageRatio(50, 100)).toBe(0.5)
    expect(usageRatio(150, 100)).toBe(1)
    expect(usageRatio(-5, 100)).toBe(0)
    expect(usageRatio(5, 0)).toBe(0)
  })
})

describe('toLogsBarChartData', () => {
  test('maps series points to chart datums', () => {
    expect(
      toLogsBarChartData([{ timestamp: '2026-11-23T08:00:00Z', ok: 10, warnings: 2, errors: 1 }])
    ).toEqual([
      { timestamp: '2026-11-23T08:00:00Z', ok_count: 10, warning_count: 2, error_count: 1 },
    ])
  })
})

describe('countryName', () => {
  test('returns a localized country name', () => {
    expect(countryName('FI', 'en')).toBe('Finland')
    expect(countryName('fi', 'fi')).toBe('Suomi')
  })

  test('falls back to the code when the region is unknown', () => {
    expect(countryName('??', 'en')).toBe('??')
  })
})

describe('formatMessage', () => {
  test('replaces known placeholders and keeps unknown ones', () => {
    expect(formatMessage('{cores} cores, {other}', { cores: 2 })).toBe('2 cores, {other}')
  })
})
