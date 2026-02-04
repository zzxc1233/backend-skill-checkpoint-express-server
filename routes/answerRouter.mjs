import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateAnswer from "../middleware/validationAnswers.mjs";

const answerRouter = Router();

// Vote on an answer
answerRouter.post("/:answerId/vote", async (req, res) => {
    try {
        const { answerId } = req.params;
        const vote = Number(req.body.vote);

        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({
                message: "Invalid request data."
            });
        }

        const checkAnswer = await connectionPool.query(
            `SELECT * FROM answers 
                LEFT JOIN answer_votes 
                ON answers.id = answer_votes.answer_id 
            WHERE answers.id = $1`,
            [answerId]
        );

        if (!checkAnswer.rows[0]) {
            return res.status(404).json({
                message: "Answer not found"
            });
        }

        let result;
        if (checkAnswer.rows[0].answer_id === 0) {
            // 1st vote : insert new record
            result = await connectionPool.query(
                `INSERT INTO answer_votes (answer_id, vote) 
                VALUES ($1, $2) 
                RETURNING *`,
                [answerId, vote]
            );
        } else {
            result = await connectionPool.query(
                `UPDATE answer_votes 
                SET vote = vote + $1 
                WHERE answer_id = $2 
                RETURNING *`,
                [vote, answerId]
            );
        }

        return res.status(200).json({
            message: "Vote on the answer has been recorded successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to vote on answer",
            error: error.message
        });
    }
});

// Get all answers
answerRouter.get("/", async (req, res) => {
    try {
        const result = await connectionPool.query(
            `SELECT * FROM answers`
        );
        return res.status(200).json({
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to get answers",
            error: error.message
        });
    }
})

// Update an answer
answerRouter.put("/:answerId", validateAnswer, async (req, res) => {
    try {
        const { answerId } = req.params;
        const { content } = req.body;
        const result = await connectionPool.query(
            `UPDATE answers SET content = $1 WHERE id = $2 RETURNING *`,
            [content, answerId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Answer not found"
            });
        }
        return res.status(200).json({
            message: "Answer updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to update answer",
            error: error.message
        });
    }
})

// Delete an answer
answerRouter.delete("/:answerId", async (req, res) => {
    try {
        const { answerId } = req.params;
        const result = await connectionPool.query(
            `DELETE FROM answers WHERE id = $1 RETURNING *`,
            [answerId]
        );
        return res.status(200).json({
            message: "Answer deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
})

export default answerRouter;
