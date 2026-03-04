/**
 * Interdisciplinary perspectives for each Human Manual lesson.
 * Enriches every lesson with 2–4 angles from Neuroscience, Anthropology,
 * Sociology, History, Biology, Medicine, Economics, Political Science, Philosophy.
 */

import type { LessonPerspective } from './humanManual';

export const lessonPerspectives: Record<string, LessonPerspective[]> = {
  'hm-rel-family-wounds': [
    { discipline: 'Neuroscience', insight: 'Attachment shapes actual brain architecture. Secure attachment develops robust prefrontal-limbic connections for emotional regulation; early neglect or chaos can leave the amygdala overreactive and the prefrontal brake weaker.' },
    { discipline: 'Anthropology', insight: 'Attachment patterns vary across cultures. Communal child-rearing in many societies distributes attachment across multiple caregivers — "family wounds" in one context might look different in another.' },
    { discipline: 'Sociology', insight: 'Social policies like parental leave, childcare access, and economic stability directly impact parents\' capacity to be emotionally present. Family wounds are not only personal — they are shaped by the systems families live in.' },
    { discipline: 'History', insight: 'The isolated nuclear family is historically recent. For most of human history, children were raised by extended kin networks. The pressure on one or two caregivers is a modern experiment.' },
  ],
  'hm-rel-affairs-betrayal': [
    { discipline: 'Neuroscience', insight: 'Betrayal trauma activates the same attachment and threat circuits as physical danger. Your brain treats the breach of trust as a survival threat — intrusive thoughts and hypervigilance are your nervous system trying to protect you.' },
    { discipline: 'Psychology', insight: 'The need for details is not pathology. Your brain cannot update its model of reality without information; obsessive questioning is the mind trying to rebuild a shattered worldview.' },
    { discipline: 'Sociology', insight: 'Monogamy and infidelity are socially constructed. How betrayal is defined, who gets blame, and what "healing" looks like vary across cultures and eras — your pain is real regardless.' },
  ],
  'hm-rel-adult-friendships': [
    { discipline: 'Sociology', insight: 'Friendship formation depends on proximity, repeated unplanned interaction, and settings that allow vulnerability. Adult life — suburbs, remote work, nuclear families — strips away the structures that used to create these automatically.' },
    { discipline: 'Anthropology', insight: 'In many cultures, close bonds are built through shared ritual, communal living, or kinship networks. The Western emphasis on "finding your people" through individual choice is a particular way of organizing connection.' },
    { discipline: 'Biology', insight: 'Loneliness isn\'t just unpleasant — it triggers stress and inflammation. Your body registers social isolation as a threat; the drive to connect is physiological.' },
  ],
  'hm-rel-boundaries-protect': [
    { discipline: 'Political Science', insight: 'Boundaries are about power: who has access to you, who sets the terms. Defining "what I will do" keeps agency with you instead of trying to control others.' },
    { discipline: 'Sociology', insight: 'Who gets to have boundaries is unequal. Women and marginalized people are often socialized to prioritize others\' comfort; saying no can feel like violating a social script.' },
    { discipline: 'Philosophy', insight: 'Boundaries express self-worth. You are defining what you will tolerate — which implies you have value worth protecting.' },
  ],
  'hm-rel-toxic-patterns': [
    { discipline: 'Neuroscience', insight: 'Familiar relationship dynamics feel "right" because they match early wiring. Your nervous system may confuse chaos with love when that was your childhood norm — change requires rewiring, not just insight.' },
    { discipline: 'Psychology', insight: 'Repetition compulsion is the unconscious drive to replay early wounds in the hope of a different outcome. Seeing the pattern is the first step to choosing differently.' },
    { discipline: 'Sociology', insight: 'Romantic love and "chemistry" are culturally scripted. Who we find attractive is shaped by family, media, and social norms — not just individual choice.' },
  ],
  'hm-rel-loneliness-epidemic': [
    { discipline: 'Biology', insight: 'Chronic loneliness increases inflammation and disrupts sleep. Your body treats sustained isolation as a survival threat — the health effects are measurable and serious.' },
    { discipline: 'Sociology', insight: 'The loneliness epidemic is structural: loss of third places, extended family, neighborhoods, and community institutions. Individuals didn\'t fail — the village was dismantled.' },
    { discipline: 'Political Science', insight: 'Policy choices — housing design, transportation, labor laws, funding for community spaces — directly shape whether people can connect. Loneliness is a collective problem.' },
  ],
  'hm-rel-difficult-people': [
    { discipline: 'Psychology', insight: 'You can\'t change others; you can only change your response. Acceptance doesn\'t mean approval — it means stopping the exhausting fight against reality.' },
    { discipline: 'Political Science', insight: 'Power dynamics shape "difficult" interactions. Gray rock and boundaries are ways to limit others\' access to your attention and emotional labor.' },
    { discipline: 'Sociology', insight: 'Who gets labeled "difficult" is often gendered and racialized. Women and people of color are more likely to be pathologized for setting limits.' },
  ],
  'hm-rel-sibling-wounds': [
    { discipline: 'Anthropology', insight: 'Sibling roles (oldest, middle, youngest) and birth order effects vary across cultures. The "longest relationship" means different things in different family structures.' },
    { discipline: 'Sociology', insight: 'Parental resources — time, attention, money — are finite. Sibling rivalry often reflects real scarcity, not just personality.' },
    { discipline: 'History', insight: 'Inheritance and primogeniture have historically formalized sibling inequality. Even when not legal, favoritism has long-lasting material and emotional effects.' },
  ],
  'hm-rel-gender-identity': [
    { discipline: 'Biology', insight: 'Sex and gender involve genetics, hormones, brain development, and lived experience. The biology is more complex than a simple binary — and that complexity is normal.' },
    { discipline: 'Anthropology', insight: 'Many cultures have long recognized more than two genders. The Western binary is one way of organizing identity, not the only way.' },
    { discipline: 'Political Science', insight: 'Gender identity is contested in law and policy. Access to healthcare, documentation, and safety depends on where you live — your pain is often political.' },
  ],
  'hm-rel-attachment-styles': [
    { discipline: 'Neuroscience', insight: 'Attachment styles reflect how your brain learned to regulate in relationship. Secure attachment supports prefrontal regulation; insecure styles are adaptations that once helped you survive.' },
    { discipline: 'Anthropology', insight: 'Attachment isn\'t universal — some cultures practice communal child-rearing where attachment distributes across multiple caregivers. "Secure" looks different in different contexts.' },
    { discipline: 'Biology', insight: 'Oxytocin and cortisol systems are calibrated by early attachment. Your body\'s stress and bonding responses were set in part by your first relationships.' },
  ],
  'hm-rel-anxious-avoidant': [
    { discipline: 'Neuroscience', insight: 'Anxious-avoidant dynamics create a push-pull that can feel addictive. The intermittent reinforcement of closeness then distance activates the same reward circuits as other intense patterns.' },
    { discipline: 'Psychology', insight: 'The anxious partner often had inconsistent caregiving; the avoidant often had enmeshment or intrusion. Both are protecting against early wounds in opposite ways.' },
    { discipline: 'Sociology', insight: 'Gender socialization can shape who tends toward anxious vs avoidant strategies — but these are learned, not fixed. Understanding the dance helps both partners.' },
  ],
  'hm-rel-emotional-unavailability': [
    { discipline: 'Psychology', insight: 'Emotional unavailability often stems from early experiences where vulnerability was unsafe. The wall isn\'t a choice against you — it\'s a survival adaptation.' },
    { discipline: 'Sociology', insight: 'Men in particular are often socialized away from emotional expression. "Unavailable" can be the result of cultural scripts, not just individual history.' },
    { discipline: 'Philosophy', insight: 'Waiting for someone to become available can feel like love, but it can also be a way of avoiding your own needs. You deserve reciprocity.' },
  ],
  'hm-rel-love-bombing': [
    { discipline: 'Psychology', insight: 'Love bombing creates intense bonding through idealization and attention. It can hijack normal attachment and make later devaluation feel like unbearable loss.' },
    { discipline: 'Political Science', insight: 'Love bombing is a form of influence and control. Recognizing it doesn\'t mean the good moments weren\'t real — it means the pattern serves power, not mutuality.' },
    { discipline: 'Neuroscience', insight: 'The dopamine hit of intense early attention is neurologically similar to addiction. Withdrawal when it stops is a real physiological experience.' },
  ],
  'hm-rel-healthy-conflict': [
    { discipline: 'Psychology', insight: 'Healthy conflict focuses on the issue, not the person. It assumes good intent and seeks repair. These skills can be learned.' },
    { discipline: 'Sociology', insight: 'How we "do" conflict is culturally learned. Some families avoid; some escalate. You can choose a different script.' },
    { discipline: 'Philosophy', insight: 'Conflict can be a form of care — it means the relationship matters enough to work through disagreement rather than pretend harmony.' },
  ],
  'hm-rel-stonewalling': [
    { discipline: 'Neuroscience', insight: 'Stonewalling often happens when the nervous system is overwhelmed. The brain goes offline — it\'s not always a choice to punish; sometimes it\'s shutdown.' },
    { discipline: 'Psychology', insight: 'The stonewaller may have learned that engagement leads to more pain. The partner often experiences it as abandonment. Both need different strategies.' },
    { discipline: 'Sociology', insight: 'In couples research, stonewalling is one of the "Four Horsemen" predicting divorce. But it can change with awareness and practice.' },
  ],
  'hm-rel-contempt': [
    { discipline: 'Psychology', insight: 'Contempt is the belief that the other is beneath you. It\'s more toxic than anger because it attacks the person\'s worth, not just their behavior.' },
    { discipline: 'Political Science', insight: 'Contempt is a power move. It establishes hierarchy. In relationship, it destroys safety and makes repair nearly impossible.' },
    { discipline: 'Sociology', insight: 'Contempt often builds from unresolved resentment. Addressing the underlying grievances is the only way to reduce it.' },
  ],
  'hm-rel-rebuilding-trust': [
    { discipline: 'Neuroscience', insight: 'Trust is built in small, repeated experiences. The brain needs consistent evidence over time to update its threat assessment.' },
    { discipline: 'Psychology', insight: 'Rebuilding doesn\'t mean forgetting. It means the injured partner chooses to give new experiences more weight than past betrayal — and that takes time.' },
    { discipline: 'Philosophy', insight: 'Trust is a gift, not an entitlement. The one who broke it must earn it; the one who was hurt gets to set the pace.' },
  ],
  'hm-rel-emotional-physical-intimacy': [
    { discipline: 'Biology', insight: 'Emotional and physical intimacy are linked through oxytocin and vasopressin. Safety and attachment support desire; stress and disconnection suppress it.' },
    { discipline: 'Psychology', insight: 'For many, emotional closeness is a prerequisite for physical intimacy. For others, physical connection builds emotional closeness. Both are valid.' },
    { discipline: 'Anthropology', insight: 'Ideas about "normal" desire and the link between love and sex vary widely across cultures and history. Your pattern may be more common than you think.' },
  ],
  'hm-rel-libido-differences': [
    { discipline: 'Biology', insight: 'Libido is influenced by hormones, health, medication, stress, and sleep. "Mismatch" often has physiological components, not just relational ones.' },
    { discipline: 'Medicine', insight: 'Many medications (SSRIs, blood pressure drugs, etc.) affect desire. So do chronic illness and pain. A medical check can be part of the picture.' },
    { discipline: 'Psychology', insight: 'Desire can be responsive rather than spontaneous — especially for some people. Understanding your desire style reduces shame and blame.' },
  ],
  'hm-rel-porn-intimacy': [
    { discipline: 'Psychology', insight: 'Porn use can affect arousal templates and expectations. It doesn\'t make someone "bad" — but it can impact real-life intimacy and is worth honest conversation.' },
    { discipline: 'Sociology', insight: 'Attitudes toward porn are deeply cultural and religious. Couples often have unspoken different values; naming them reduces shame and conflict.' },
    { discipline: 'Neuroscience', insight: 'Porn can deliver intense novelty and stimulation. Real partners can\'t compete with that — and shouldn\'t have to. Balance is possible.' },
  ],
  'hm-rel-polyamory': [
    { discipline: 'Anthropology', insight: 'Monogamy is one way to organize partnership; many societies have practiced various forms of non-exclusive or plural marriage. Your choice has historical company.' },
    { discipline: 'Sociology', insight: 'Polyamory requires explicit negotiation of boundaries and consent. The skills — communication, jealousy management, compersion — are learnable.' },
    { discipline: 'Philosophy', insight: 'Ethical non-monogamy rests on honesty and agreement. Secrecy and broken agreements aren\'t "poly" — they\'re betrayal, whatever the relationship structure.' },
  ],
  'hm-rel-long-distance': [
    { discipline: 'Psychology', insight: 'Long-distance works when both partners invest in communication and have a shared vision of the future. Uncertainty about reunion is the real stressor.' },
    { discipline: 'Sociology', insight: 'Migration, education, and work increasingly separate partners. Long-distance is a modern norm for many — you\'re not alone in the challenge.' },
    { discipline: 'History', insight: 'People have maintained intimate bonds across distance for centuries through letters and now technology. The form changes; the need for connection doesn\'t.' },
  ],
  'hm-rel-when-to-leave': [
    { discipline: 'Psychology', insight: 'Leaving is often the hardest decision because attachment doesn\'t turn off when a relationship is harmful. Grief and relief can coexist.' },
    { discipline: 'Political Science', insight: 'You have the right to leave. No one is entitled to your presence. Staying "for the kids" or "because they need me" can be a choice, but it\'s not an obligation.' },
    { discipline: 'Philosophy', insight: 'You don\'t need a "good enough" reason to leave. Your desire to go is sufficient. You are allowed to choose your own life.' },
  ],
};
