import mongoose from "mongoose";

const ChangelogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: {
        description: { type: String, required: true },
        updates: [{ type: String, required: true }],
        images: [{
            src: { type: String, required: true }
        }]
    }
});

const Changelog = mongoose.model("Changelog", ChangelogSchema);
export default Changelog;