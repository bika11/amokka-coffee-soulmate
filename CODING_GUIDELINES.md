# Amokka Coffee Quiz - Coding Guidelines

This document outlines the coding standards and best practices for the Amokka Coffee Quiz project. These guidelines are designed to be used in conjunction with tools like GitHub Copilot to ensure code quality, consistency, and maintainability.

**I. Core Principles**

*   **Clarity:** Code should be easy to read and understand.
*   **Consistency:** Follow consistent formatting, naming, and structural patterns.
*   **Maintainability:** Code should be easy to modify and extend.
*   **Testability:** Code should be designed for easy testing.
* **Readability:** Code should be easy to understand, even for someone who did not write it.

**II. Code Style & Formatting**

*   **Indentation:** Use **2 spaces** for indentation.
*   **Line Length:** Keep lines under **100 characters** whenever possible.
*   **Whitespace:** Use whitespace (spaces, blank lines) to separate logical code blocks.
*   **Naming Conventions:**
    *   **Variables & Functions:** `camelCase` (e.g., `userPreferences`, `calculateRecommendation`)
    *   **Classes:** `PascalCase` (e.g., `CoffeeQuiz`, `DatabaseHandler`)
    * **Constants:** `UPPER_SNAKE_CASE` (e.g. `MAX_QUESTIONS`)
    * **Avoid:** Single letter names.
*   **Comments:**
    *   Explain *why* code does something, not just *what* it does.
    *   Document edge cases and non-obvious logic.
    *   Add comments to all new code.
    * Use comments to explain what you want copilot to do.
*   **Linters & Formatters:** Use a linter (e.g., ESLint for JavaScript) and a formatter (e.g., Prettier). Configure them to match these guidelines.
* **Enforcement:** The linter and formatter should be automatically ran before commiting code.

**III. Code Structure & Design**

*   **Single Responsibility Principle (SRP):** Each function, class, or module should have one specific responsibility.
*   **Short Functions:** Keep functions under 20-30 lines, when possible.
*   **DRY (Don't Repeat Yourself):** Refactor duplicated code into reusable components.
*   **Modularity:** Break the project into logical modules (e.g., `quizLogic`, `dataAccess`, `uiElements`).
* **Meaningfull Errors:** Avoid generic error messages, and always provide meaningfull ones.

**IV. Error Handling**

*   **Explicit Error Handling:** Use `try...catch` blocks (or the equivalent) to handle exceptions.
*   **Specific Error Types:** Use specific error types (e.g., `DatabaseError`, `ValidationError`) instead of generic `Error`.
* **Log Errors:** Log all errors, providing as much context as possible.

**V. Testing**

*   **Unit Tests:** Write unit tests for individual functions and modules.
*   **Integration Tests:** Write tests to check how modules interact.
* **Test Driven Development (TDD):** Write tests before writing code.
* **Test All Code** Test all the code, even if it was written by copilot.

**VI. Version Control**

*   **Meaningful Commit Messages:** Describe *what* changed and *why*.
*   **Branching Strategy:** Use a clear branching strategy (e.g., Gitflow).
*   **Code Reviews:** All code must be reviewed before merging.
* **Commit Reminders:**
    * **After Every Change:** After completing a code change (adding a function, fixing a bug, etc.), immediately consider how the change should be committed.
    * **Commit Message Suggestion:** Each change should be accompanied by a commit message suggestion. This suggestion should follow the format: `Type: Description`.
        * **Type:** This should be one of the following: `Feat` (for new features), `Fix` (for bug fixes), `Refactor` (for code improvements), `Docs` (for documentation changes), `Style` (for style changes), `Test` (for adding or improving tests), `Chore` (for other maintenance).
        * **Description:** A short, concise description of the change.
        * **Example:** `Fix: Corrected error in recommendation algorithm`. `Feat: added advanced mode to quiz`.
    * **Commit Reminder:** After each change, the tooling should remind you to commit.
    * **Committing** Commit small, but functional changes, and never commit broken code.

**VII. Logging**

*   **Log Levels:**
    *   `Debug`: Detailed information for development.
    *   `Info`: General application progress.
    *   `Warning`: Potential issues.
    *   `Error`: Errors that prevent normal operation.
    *   `Critical`: Severe errors that may crash the app.
*   **Log Structure:**
    *   `Timestamp`
    *   `Log Level`
    *   `Source` (module/component)
    *   `Message`
    *   `Context` (optional, relevant data)
* **Logging Errors**
    * Always log errors, never ignore them.
    * Log the error message, error type, and stack trace if available.
* **Log Events**
    * Log any important events, such as when a user successfully completes a quiz, or an admin triggers a data update.
* **Log review**
    * Regularly review the logs.

**VIII. Using Copilot Effectively**

*   **Lead by Example:** Write examples of well-formatted code to guide Copilot.
*   **Descriptive Comments:** Use comments to explain what you want Copilot to generate.
*   **Clear Naming:** Use descriptive names for variables, functions, and classes.
*   **Type Hints:** Use type hints (where applicable) for better code generation.
*   **Never Blindly Accept:** Always review Copilot's suggestions.
*   **Refactor & Rewrite:** Don't be afraid to rewrite or modify Copilot's code.
* **Test Copilot Code:** Test all code, even code written by copilot.
* **Enforcement:** Use linters, formatters, and code reviews to enforce the above.

**IX. Further Notes**
* **Avoid** Using code generators to write comments. Write the comments your self.
* If any doubt arises, default to reading the code over what copilot outputs.

**Explanation of the Changes:**

1.  **Section VI: Version Control**
    *   I've added a new section called "**Commit Reminders**" under "Version Control."
2.  **Commit Message Suggestion:**
    *   I've added very specific guidelines on how to formulate a commit message suggestion using `Type: Description` format.
3. **Commit Reminder**
    * This explains that copilot, or another tool, should provide this suggestion, and remind the user to commit.
4.  **After Every Change:**
    *   The wording emphasizes that these actions should happen immediately after each meaningful code change, not at the end of a longer coding session.

**How This Works with Copilot**

*   **Reference in Comments:** You can reference this in comments, such as: `// Follow CODING_GUIDELINES.md for commit practices.`
*   **Prompting for Commit Messages:**
    *   After you write some code and want to commit, you can write a comment like:
        ```javascript
        // Commit: ...
        ```
        Or
        ```javascript
        // Please suggest a commit message, following the format in the CODING_GUIDELINES.md
        ```
    * Copilot, or other tooling, should then read the file, and generate a message.
* Copilot can also be set up to give this suggestion after every change.

**Important Considerations:**

*   **Tooling:** Copilot *does not* automatically handle commit reminders or commit message suggestions. You will need to manually trigger it to do so. The idea is that, by writing the comment, it will remind you to do this. It may be possible to set this up to automatically happen using other plugins.
* **Review:** Ensure that the sugestions from copilot are correct, and change them if they are not.
*   **Team Agreement:** This process will only be effective if the entire team buys into it.
*   **Flexibility:** You may need to adjust the commit types or the exact wording of the guidelines based on your team's workflow.

This should achieve the desired behavior, and help you keep a more consistent commit log! Let me know if you have any other modifications or questions.
