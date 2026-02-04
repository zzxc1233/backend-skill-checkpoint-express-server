import express from "express";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import questionRouter from "./routes/questionRouter.mjs";
import answerRouter from "./routes/answerRouter.mjs";

const app = express();
const port = 4000;

app.use(express.json());
app.use("/questions", questionRouter);
app.use("/answers", answerRouter);

// swagger definition
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Question & Answer API",
      version: "1.0.0",
      description: "API for a Question and Answer platform",
    },
  },
  apis: ["app.mjs"],
};

// swagger documentation
const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     responses:
 *       201:
 *         description: Question created successfully.
 */

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions by title or category
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get a question by ID
 *     parameters:
 *       - name: questionId
 *         in: path
 *         required: true
 *         description: ID of the question to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */


// test route
app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
