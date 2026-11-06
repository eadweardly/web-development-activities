const FIELD_NOTES = {
  ethics: {
    about: "Ethics studies how we ought to live and act. It asks what makes actions right or wrong, what a good character looks like, and how our choices affect the people around us.",
    questions: ["What makes an action right or wrong?", "Is a good life about virtue, duty, or results?", "Can moral claims be true for everyone, everywhere?"],
  },
  metaphysics: {
    about: "Metaphysics looks at the most general features of reality: what exists, what it means to exist, and how ideas like time, cause, and identity fit together.",
    questions: ["What kinds of things really exist?", "Is the future already settled?", "What keeps a thing the same thing over time?"],
  },
  epistemology: {
    about: "Epistemology is the study of knowledge. It asks how we come to know things, what separates knowing from lucky guessing, and how far the senses and reasoning can be trusted.",
    questions: ["What is knowledge?", "Can we be certain of anything at all?", "How do experience and reason each shape what we know?"],
  },
  logic: {
    about: "Logic studies correct reasoning. It sets out what makes an argument valid, how a conclusion follows from its premises, and how mistakes in thinking can be spotted.",
    questions: ["What makes an argument valid?", "How can a sound argument be told apart from a merely persuasive one?", "Can paradoxes be resolved?"],
  },
  "political philosophy": {
    about: "Political philosophy asks how societies should be organised. It looks at authority, justice, liberty, and the duties that citizens and states owe one another.",
    questions: ["What gives a government the right to rule?", "What would a fair sharing of power and goods look like?", "How much freedom should an individual have?"],
  },
  aesthetics: {
    about: "Aesthetics explores beauty, art, and taste. It asks what makes something beautiful, how art moves us, and whether judgments of taste can be right or wrong.",
    questions: ["What makes something beautiful?", "What is the purpose of art?", "Is taste personal, or can it be judged?"],
  },
  ontology: {
    about: "Ontology is the part of metaphysics that deals with being itself: which basic kinds of things there are, and what it means for each of them to exist.",
    questions: ["What are the basic categories of being?", "Do numbers, ideas, or persons exist in the same way as stones?", "What does it mean for something to exist?"],
  },
  mind: {
    about: "The philosophy of mind investigates consciousness, thought, and perception, and how the mind is related to the body and the brain.",
    questions: ["What is consciousness?", "Is the mind the same as the brain?", "Can a machine think?"],
  },
  religion: {
    about: "The philosophy of religion examines faith and reason, the idea of God, the problem of evil, and the meaning of religious experience.",
    questions: ["Can the existence of God be argued for or against?", "How can suffering be squared with a good creator?", "What place does faith have next to reason?"],
  },
  language: {
    about: "The philosophy of language studies meaning: how words connect to the world, how sentences carry truth, and how people understand one another.",
    questions: ["What does it mean for a word to have meaning?", "How do words refer to things?", "Can some thoughts not be put into words?"],
  },
  science: {
    about: "The philosophy of science asks how scientific knowledge works: how evidence supports a theory, what counts as an explanation, and why theories change.",
    questions: ["What separates science from other ways of knowing?", "How much can evidence prove?", "Do scientific theories describe reality or just predict it?"],
  },
  mathematics: {
    about: "The philosophy of mathematics considers what numbers and proofs are, why mathematics works so well, and whether mathematical objects exist apart from us.",
    questions: ["Are mathematical truths discovered or invented?", "What makes a proof convincing?", "Do numbers exist?"],
  },
  law: {
    about: "The philosophy of law looks at what law is, why we should obey it, and how it relates to justice and morality.",
    questions: ["What makes a rule a law?", "Is an unjust law still a law?", "Why does punishment need a justification?"],
  },
  history: {
    about: "The philosophy of history asks whether the past has a direction or meaning, and how we can know what happened long ago.",
    questions: ["Does history move toward a goal?", "How reliable is our knowledge of the past?", "What role do individuals play against larger forces?"],
  },
  economics: {
    about: "Economic questions in philosophy deal with value, work, property, and exchange, and with how wealth should be made and shared.",
    questions: ["What gives a thing its value?", "Who has a right to property?", "What is a fair distribution of wealth?"],
  },
  psychology: {
    about: "Philosophical psychology studies how people think, feel, and decide: emotion, motivation, habit, and the workings of the self.",
    questions: ["What drives human behaviour?", "How do emotions relate to reason?", "What is the self?"],
  },
  phenomenology: {
    about: "Phenomenology describes experience as it is lived from the inside, looking at how things appear to us before we explain them.",
    questions: ["What is it like to experience something?", "How do perception and meaning take shape?", "What is the role of the body in experience?"],
  },
  existentialism: {
    about: "Existentialism centres on freedom, choice, and responsibility, and on how people create meaning in a world that does not hand it to them.",
    questions: ["How should a person live without a given purpose?", "What is the weight of freedom?", "How can a life be authentic?"],
  },
  education: {
    about: "The philosophy of education asks what learning is for, how character and knowledge are formed, and what teachers and societies owe students.",
    questions: ["What is the aim of education?", "Can virtue be taught?", "How should a child be raised?"],
  },
  society: {
    about: "Social philosophy examines groups, institutions, and the ties between people: how societies hold together and how they change.",
    questions: ["What do individuals owe their community?", "How do institutions shape us?", "What makes a society just?"],
  },
  cosmology: {
    about: "Cosmology in philosophy asks about the origin, order, and structure of the universe, and our place within it.",
    questions: ["Did the universe have a beginning?", "Why is there order in nature?", "What is our place in the cosmos?"],
  },
};

FIELD_NOTES.politics = FIELD_NOTES["political philosophy"];
FIELD_NOTES.social = FIELD_NOTES.society;
FIELD_NOTES.religious = FIELD_NOTES.religion;
FIELD_NOTES["moral philosophy"] = FIELD_NOTES.ethics;
FIELD_NOTES.ontologies = FIELD_NOTES.ontology;

const fieldKey = name => name.toLowerCase().replace(/^philosophy of /, "").replace(/^the /, "").trim();
