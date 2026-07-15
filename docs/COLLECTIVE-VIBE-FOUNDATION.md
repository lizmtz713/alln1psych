# Collective Vibe foundation

## Product promise

InGauge can help people express how life feels right now and, when they explicitly opt in, contribute a privacy-preserving signal to a larger picture. The public language may say **vibe**. Internally this remains **collective sentiment** so it is not confused with a diagnosis, fact, forecast, or election result.

The population view answers: “What are participating people reporting?” It must never claim: “This is how everyone feels.”

## Separation from the private system

- Private gauges, journal text, voice recordings, contacts, relationship data, wearable data, and AI interpretations never enter the collective dataset.
- A private check-in does not imply consent to contribute.
- Contribution is a separate, plain-language action with a preview of the exact fields being sent.
- Withdrawing from collective contribution does not delete or weaken the private InGauge experience.
- Collective data never changes a user's private gauges or personal recommendations.

## Minimum contribution

An initial contribution should contain only:

- broad sentiment band selected by the user;
- optional broad topic selected by the user (for example cost of living, work, safety, health, family, community, or politics);
- coarse geography selected by the user, never precise location;
- coarse age band, optional;
- server timestamp;
- one-time contribution identifier that is not publicly linkable to an account.

Free text, political party, candidate preference, race, religion, sexual orientation, disability, exact age, ZIP code, device identifiers, and contact graph are excluded from the first version.

## Publication rules

- Do not display a segment with fewer than 100 distinct contributors in the selected time window.
- Combine or suppress small geographic and demographic cells.
- Apply contribution-rate limits and coordinated-manipulation detection.
- Show sample size, time window, coverage limitations, and change from the comparable prior window.
- Never show individual dots, raw submissions, leaderboards, or “happiest/saddest person” mechanics.
- Never allow filters whose combination could isolate a person or a small group.
- Historical exports require the same suppression rules as the live view.

The threshold is a conservative product starting point, not a formal anonymity guarantee. Before launch, privacy engineering must select and document an appropriate statistical disclosure-control method.

## Politics boundary

Political context may be a user-selected topic, but InGauge is not a persuasion, voter-targeting, campaigning, polling, or candidate-scoring product.

Prohibited uses include:

- targeting political messages based on emotional state;
- selling or sharing sentiment segments with campaigns, parties, PACs, employers, insurers, data brokers, or law enforcement;
- predicting an individual's ideology, turnout, vote, protest participation, or persuadability;
- ranking candidates by inferred emotional impact;
- using private relationship, health, or wearable data for political analysis;
- presenting an opt-in convenience sample as representative public opinion.

## Rollout gates

1. Prove the private Notice → Try → Report → Learn loop.
2. Complete consent, deletion, export, RLS, abuse, and two-account tests.
3. Conduct privacy-threat modeling and independent legal/ethics review.
4. Run a closed, non-political pilot with synthetic public aggregates.
5. Validate suppression and manipulation defenses.
6. Only then consider a real opt-in collective pilot.

## Initial vocabulary

- **My vibe:** the user's own plain-language report.
- **Shared vibe:** the exact minimal contribution the user previews and approves.
- **Collective vibe:** an aggregate of qualifying contributions.
- **Context:** the broad issue the contributor selected.
- **Coverage:** who participated and who may be missing.
- **Confidence:** data-quality language, never psychological certainty.

