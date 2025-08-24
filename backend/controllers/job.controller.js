import { Job } from "../models/job.model.js";

// admin posts a job
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;

    const userId = req.id;
    if (!userId) {
      return res.status(401).json({
        message: "User ID missing. Authentication required.",
        success: false,
      });
    }

    const salaryNumber = Number(salary);
    const positionNumber = Number(position);

    if (isNaN(salaryNumber) || isNaN(positionNumber)) {
      return res.status(400).json({
        message: "Salary and Position must be valid numbers.",
        success: false,
      });
    }

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Something is missing.",
        success: false,
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: salaryNumber,
      location,
      jobType,
      experienceLevel: experience,
      position: positionNumber,
      company: companyId,
      created_by: userId,
    });

    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true,
    });
  } catch (error) {
    console.error("Error in postJob:", error);
    return res.status(500).json({
      message: "Server error while posting the job",
      success: false,
    });
  }
};

// student - get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Error in getAllJobs:", error);
    return res.status(500).json({
      message: "Server error while fetching jobs",
      success: false,
    });
  }
};

// student - get job by ID
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
    });
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error("Error in getJobById:", error);
    return res.status(500).json({
      message: "Server error while fetching the job",
      success: false,
    });
  }
};

// admin - get jobs created by admin
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId })
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Error in getAdminJobs:", error);
    return res.status(500).json({
      message: "Server error while fetching admin jobs",
      success: false,
    });
  }
};

