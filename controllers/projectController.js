const Project = require("../models/Project");

// CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const {
      projectName,
      description,
      templateId,
    } = req.body;

    if (!projectName) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      userId: req.user.userId,
      projectName,
      description,
      templateId,
    });

    return res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL PROJECTS
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();

    return res.status(200).json({
  success: true,
  projects,
});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROJECT BY ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// AUTO SAVE PROJECT
exports.autoSaveProject = async (req, res) => {
  try {
    const updateData = {
      builderData: req.body.builderData,
    };

    // Sync project name
    if (req.body.builderData?.projectName) {
      updateData.projectName =
        req.body.builderData.projectName;
    }

    // Save generated HTML
    if (req.body.htmlContent) {
      updateData.htmlContent =
        req.body.htmlContent;
    }

    const project =
      await Project.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Project autosaved successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DUPLICATE PROJECT
exports.duplicateProject = async (
  req,
  res
) => {
  try {
    const project =
      await Project.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const duplicatedProject =
      await Project.create({
        userId: project.userId,
        projectName:
          project.projectName +
          " Copy",
        description:
          project.description,
        templateId:
          project.templateId,
        thumbnail:
          project.thumbnail,
        builderData:
          project.builderData,
        status: "draft",
      });

    return res.status(201).json({
      success: true,
      project:
        duplicatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE THUMBNAIL
exports.updateThumbnail = async (
  req,
  res
) => {
  try {
    const project =
      await Project.findByIdAndUpdate(
        req.params.id,
        {
          thumbnail:
            req.body.thumbnail,
        },
        { new: true }
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SAVE HTML PROJECT
exports.saveHtmlProject = async (
  req,
  res
) => {
  try {
    const { htmlContent } =
      req.body;

    const project =
      await Project.findByIdAndUpdate(
        req.params.id,
        { htmlContent },
        { new: true }
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Project saved successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};