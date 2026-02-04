export default function validateQuestion(req, res, next) {
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

    next();
}