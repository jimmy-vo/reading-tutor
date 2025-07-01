# Project Progress

## Functionalities

### Backend
- Call Azure OpenAI model to generate new topic with a list of provided topics. Topic must be 1 sentence long and appropriate for kids.
- Call Azure OpenAI model to generate paragraphs, questions, and expected answers.
- Verify user's answers by calling Azure OpenAI model upon submission.

### Frontend
- Maintain topics in local storage, generate new topic and use that to generate new content.
- Show short and simple paragraphs for kids to read.
- Display 5 questions related to the paragraphs.
- Provide textboxes for users to submit answers.
- Include a single submit button for submitting answers.

## Project Progress
### Main Goal
The main goal of the app is to help kids learn to read by showing short and simple paragraphs, followed by questions and textboxes for answers, with a single submit button.

### Completed
- Added health endpoint
- Implemented `generateContent` endpoint to generate reading texts, questions, and expected answers using Azure OpenAI model.
- Implemented `verifyAnswers` endpoint to evaluate user answers against provided paragraphs, questions, and expected answers using Azure OpenAI model.

### Pending
- Implement frontend to display paragraphs, questions, textboxes for answers, and a submit button.
