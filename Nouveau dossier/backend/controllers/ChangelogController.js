import Changelog from "../models/Changelog.js";
import {ChangelogSchema} from "../middlewares/Validator.js";

export const addChangelog = async (req, res) => {
    try {
        const { error, value } = ChangelogSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const changelog = new Changelog(value);
        await changelog.save();
        return res.status(201).json(changelog);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getChangelog = async (req, res) => {
    try {
        const changelogs = await Changelog.find();
        return res.status(200).json(changelogs);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateChangelog = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "ID is required" });

        const { error, value } = ChangelogSchema.validate(req.body, { allowUnknown: true, presence: "optional" });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const updatedChangelog = await Changelog.findByIdAndUpdate(id, value, { new: true });
        if (!updatedChangelog) return res.status(404).json({ error: "Changelog not found" });

        return res.status(200).json(updatedChangelog);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const deleteChangelog = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "ID is required" });

        const deletedChangelog = await Changelog.findByIdAndDelete(id);
        if (!deletedChangelog) return res.status(404).json({ error: "Changelog not found" });

        return res.status(200).json({ message: "Changelog deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};