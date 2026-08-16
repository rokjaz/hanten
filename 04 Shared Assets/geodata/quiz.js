// Generic guess-before-reveal quiz renderer for Daily Flip. Structure only —
// styling lives in the page's own <style> block via the class names below
// (.quiz-prompt, .quiz-choices, .quiz-choice, .quiz-feedback, .quiz-reveal),
// same pattern as data/save-image.js leaving layout to the host page.
const HantenQuiz = {
  // entry: { href, title, quiz: { prompt, choices, correct } }
  render(container, entry) {
    container.innerHTML = "";
    const { prompt, choices, correct } = entry.quiz;

    const promptEl = document.createElement("div");
    promptEl.className = "quiz-prompt";
    promptEl.textContent = prompt;
    container.appendChild(promptEl);

    const choicesEl = document.createElement("div");
    choicesEl.className = "quiz-choices";
    container.appendChild(choicesEl);

    const buttons = choices.map((choice, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-choice";
      btn.textContent = choice;
      btn.addEventListener("click", () => this._reveal(container, entry, buttons, btn, i, correct));
      choicesEl.appendChild(btn);
      return btn;
    });
  },

  _reveal(container, entry, buttons, chosenBtn, chosenIndex, correct) {
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === correct) btn.classList.add("correct");
      else if (i === chosenIndex) btn.classList.add("wrong");
    });

    const feedback = document.createElement("div");
    feedback.className = "quiz-feedback";
    feedback.textContent = chosenIndex === correct ? "Correct." : "Not quite.";
    container.appendChild(feedback);

    const reveal = document.createElement("a");
    reveal.className = "quiz-reveal";
    reveal.href = entry.href;
    reveal.textContent = "See the full graphic →";
    container.appendChild(reveal);
  },
};
