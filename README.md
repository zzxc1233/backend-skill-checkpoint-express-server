# Question & Answer API Server

A robust RESTful API for a Question and Answer platform, built with Node.js, Express, and PostgreSQL.

## Features

- **Questions**: Create, read, update, delete, and search questions by title or category.
- **Answers**: Post answers to questions, view answer lists, and manage specific answers.
- **Voting System**: Vote (+1 or -1) on both questions and answers with automatic record initialization.
- **Data Integrity**: Manual cascade deletion ensures that deleting a question automatically cleans up all associated answers, question votes, and answer votes.
- **Validation**: Strict validation for required fields and character limits (e.g., answers must not exceed 300 characters).

## Getting Started

### Prerequisites

- Node.js installed
- PostgreSQL database running

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your database connection in `utils/db.mjs`.

### Running the Server

```bash
npm start
```

The server will be running at `http://localhost:4000`.

## API Reference

### Questions (`/questions`)

| Method   | Endpoint                      | Description                                                  |
| :------- | :---------------------------- | :----------------------------------------------------------- |
| `GET`    | `/questions`                  | Retrieve all questions                                       |
| `GET`    | `/questions/:questionId`      | Retrieve a specific question by ID                           |
| `GET`    | `/questions/search`           | Search questions by `title` or `category` (query parameters) |
| `POST`   | `/questions`                  | Create a new question (`title`, `description`, `category`)   |
| `PUT`    | `/questions/:questionId`      | Update a question's details                                  |
| `DELETE` | `/questions/:questionId`      | Delete a question (cascades to answers and votes)            |
| `POST`   | `/questions/:questionId/vote` | Vote (+1/-1) on a question                                   |

### Answers

| Method   | Endpoint                         | Description                                  |
| :------- | :------------------------------- | :------------------------------------------- |
| `GET`    | `/questions/:questionId/answers` | Retrieve all answers for a specific question |
| `POST`   | `/questions/:questionId/answers` | Post a new answer (max 300 characters)       |
| `GET`    | `/answers`                       | Retrieve all answers in the system           |
| `PUT`    | `/answers/:answerId`             | Update an answer                             |
| `DELETE` | `/answers/:answerId`             | Delete a specific answer                     |
| `POST`   | `/answers/:answerId/vote`        | Vote (+1/-1) on an answer                    |

## Technologies Used

- **Framework**: Express.js
- **Database**: PostgreSQL (pg)
- **Environment**: Node.js
