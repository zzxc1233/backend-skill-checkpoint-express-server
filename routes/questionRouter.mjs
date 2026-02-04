import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateQuestion from "../middleware/validationQuestions.mjs";
import validateAnswer from "../middleware/validationAnswers.mjs";

const questionRouter = Router();

// Create a new question
questionRouter.post("/", validateQuestion, async (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "title is required",
            });
        }
        if (!description) {
            return res.status(400).json({
                message: "description is required",
            });
        }
        if (!category) {
            return res.status(400).json({
                message: "category is required",
            });
        }

        const result = await connectionPool.query(
            `INSERT INTO questions (title, description, category) 
            VALUES ($1, $2, $3) 
            RETURNING *`,
            [title, description, category],
        );

        return res.status(201).json({
            message: "Question created successfully.",
            data: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to create question.",
        });
    }
});

// Get all questions
questionRouter.get("/", async (req, res) => {
    try {
        const result = await connectionPool.query("SELECT * FROM questions");
        return res.json(result.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to fetch questions.",
        });
    }
});

// Search questions by title or category
questionRouter.get("/search", async (req, res) => {
    try {
        const title = req.query.title || "";
        const category = req.query.category || "";

        let query = "SELECT * FROM questions"
        const values = []
        const condition = []

        if (!title && !category) {
            const result = await connectionPool.query("SELECT * FROM questions")
            return res.status(200).json({
                data: result.rows
            });
        }

        if (title) {
            condition.push(`title ILIKE $${values.length + 1}`)
            values.push(`%${title}%`)
        }

        if (category) {
            condition.push(`category ILIKE $${values.length + 1}`)
            values.push(`%${category}%`)
        }

        if (condition.length > 0) {
            query += " WHERE " + condition.join(" AND ");
        }

        const result = await connectionPool.query(query, values)

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        return res.status(200).json({
            data: result.rows
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to fetch questions.",
        });
    }
})

// Get a question by ID
questionRouter.get("/:questionId", async (req, res) => {
    try {
        const { questionId } = req.params;
        const result = await connectionPool.query(
            "SELECT * FROM questions WHERE id = $1",
            [questionId],
        );
        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Question not found.",
            });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to fetch questions.",
        });
    }
});

// Update a question by ID
questionRouter.put("/:questionId", validateQuestion, async (req, res) => {
    try {
        const { questionId } = req.params;
        const { title, description, category } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "title is required",
            });
        }
        if (!description) {
            return res.status(400).json({
                message: "description is required",
            });
        }
        if (!category) {
            return res.status(400).json({
                message: "category is required",
            });
        }

        const result = await connectionPool.query(
            `UPDATE questions 
            SET title = $1, 
                description = $2, 
                category = $3
            WHERE id = $4 
            RETURNING *`,
            [title, description, category, questionId],
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Question not found.",
            });
        }

        return res.status(200).json({
            message: "Question updated successfully.",
            data: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to update question.",
        });
    }
})

// Delete a question by ID
questionRouter.delete("/:questionId", async (req, res) => {
    try {
        const { questionId } = req.params;

        // delete answer votes when question is deleted
        await connectionPool.query(
            "DELETE FROM answer_votes WHERE answer_id IN (SELECT id FROM answers WHERE question_id = $1)",
            [questionId]
        );

        // delete answers when question is deleted
        await connectionPool.query(
            "DELETE FROM answers WHERE question_id = $1",
            [questionId]
        );

        // delete votes when question is deleted
        await connectionPool.query(
            "DELETE FROM question_votes WHERE question_id = $1",
            [questionId]
        );

        const result = await connectionPool.query(
            "DELETE FROM questions WHERE id = $1 RETURNING *",
            [questionId],
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Question not found.",
            });
        }
        return res.status(200).json({
            message: "Question post has been deleted successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to delete question.",
        });
    }
})

// Get answers for a question
questionRouter.get("/:questionId/answers", async (req, res) => {
    try {
        const { questionId } = req.params;

        const questionCheck = await connectionPool.query(
            "SELECT id FROM questions WHERE id = $1",
            [questionId]
        );

        if (!questionCheck.rows[0]) {
            return res.status(404).json({
                message: "Question not found.",
            });
        }

        const result = await connectionPool.query(
            "SELECT * FROM answers WHERE question_id = $1",
            [questionId],
        );

        return res.status(200).json({
            data: result.rows
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to fetch answers.",
        });
    }
})

// Create an answer for a question
questionRouter.post("/:questionId/answers", validateAnswer, async (req, res) => {
    try {
        const { questionId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                message: "Invalid request data.",
            });
        }

        if (content.length > 300) {
            return res.status(400).json({
                message: "Answer must not exceed 300 characters.",
            });
        }

        const questionCheck = await connectionPool.query(
            "SELECT id FROM questions WHERE id = $1",
            [questionId]
        );

        if (!questionCheck.rows[0]) {
            return res.status(404).json({
                message: "Question not found.",
            });
        }

        const result = await connectionPool.query(
            `INSERT INTO answers (question_id, content) 
            VALUES ($1, $2) 
            RETURNING *`,
            [questionId, content],
        );

        return res.status(201).json({
            message: "Answer created successfully.",
            data: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to create answer.",
        });
    }
})

// Delete answers for a question
questionRouter.delete("/:questionId/answers", async (req, res) => {
    try {
        const { questionId } = req.params;

        const questionCheck = await connectionPool.query(
            "SELECT id FROM questions WHERE id = $1",
            [questionId]
        );

        if (!questionCheck.rows[0]) {
            return res.status(404).json({
                message: "Question not found.",
            });
        }

        const result = await connectionPool.query(
            "DELETE FROM answers WHERE question_id = $1 RETURNING *",
            [questionId],
        );
        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Answer not found.",
            });
        }
        return res.status(200).json({
            message: "All answers for the question have been deleted successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to delete answer.",
        });
    }
})

// Vote on a question
questionRouter.post("/:questionId/vote", async (req, res) => {
    try {
        const { questionId } = req.params;
        const vote = Number(req.body.vote);

        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({
                message: "Invalid request data.",
            });
        }

        const checkQuestion = await connectionPool.query(
            `SELECT questions.id, question_votes.vote 
                FROM questions 
                LEFT JOIN question_votes 
                ON questions.id = question_votes.question_id
                WHERE questions.id = $1`,
            [questionId]
        );

        if (!checkQuestion.rows[0]) {
            return res.status(404).json({
                message: "Question not found.",
            });
        }

        const voteRecord = await connectionPool.query(
            "SELECT * FROM question_votes WHERE question_id = $1",
            [questionId]
        );

        let result;
        if (voteRecord.rows.length === 0) {
            // 1st vote : insert new record
            result = await connectionPool.query(
                `INSERT INTO question_votes (question_id, vote)
                VALUES ($1, $2)
                RETURNING *`,
                [questionId, vote]
            );
        } else {
            result = await connectionPool.query(
                `UPDATE question_votes 
                SET vote = vote + $1
                WHERE question_id = $2 
                RETURNING *`,
                [vote, questionId]
            );
        }

        return res.status(200).json({
            message: "Vote on the question has been recorded successfully.",
            data: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to vote on question.",
            error: error.message
        });
    }
})

export default questionRouter;
