# Chapter 1: Abstract

## Project Summary
The Worship Song Library is a comprehensive digital management system designed specifically for church musical environments. Its primary goal is to centralize, organize, and intelligently display worship songs across multiple languages, including Hindi, Marathi, and English. The system addresses the technical challenges of chord alignment and real-time transposition, ensuring that musicians can access perfectly formatted sheet music on any device, from desktop projectors to mobile tablets.

## Core Problem
Traditional worship environments rely on physical songbooks or simple digital text files. These formats lack:
1. Dynamic Transposition: Chords cannot be adjusted to fit a singer's vocal range without manual recalculation.
2. Device Responsiveness: Space-based chord alignment breaks on narrow mobile screens.
3. Searchability: Finding songs by lyrics, number, or language is often slow and inefficient.

## Solution
This project implements an intelligent rendering engine that treats chords and lyrics as structured data rather than plain text. By utilizing a specific `[C]` anchor format and a backend processing pipeline, the system ensures:
- Perfect Alignment: Chords are anchored to specific characters in the lyrics.
- Instant Transposition: Chords are recalculated on-the-fly using chromatic scale logic.
- Multi-Script Support: Seamless switching between Roman transliteration and original scripts (Devanagari).
- Responsive Display: A mobile-first rendering logic that maintains chord-lyric relationships even when lines are split.

## Impact
The result is a professional-grade platform that enhances the worship experience by reducing technical friction for musicians and leaders, allowing them to focus on the musical performance rather than formatting issues.

