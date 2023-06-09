const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Department = require('../models/Department')
const { verifyUser } = require('../middlewares/auth')
const { userTypes } = require('../utils/util')
const multer = require('multer')
const fs = require('fs').promises
const Rating = require('../models/Rating')
const Employee = require('../models/Employee')
const Aws = require('aws-sdk')
const uuid = require("uuid");
const path = require("path")

router.use(['/add', '/edit', '/delete'], verifyUser);

// Configure AWS SDK with your credentials and region
Aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION,
  endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`
});

// Create an S3 instance
const s3 = new Aws.S3();

// Multer Configuration
const upload = multer({
  fileFilter: (req, file, cb) => {
    // cb = callback
    const allowedTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp']
    const ext = path.extname(file.originalname).replace('.', '')
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('File type not allowed'), false)
    }
  }
})

router.post('/add', upload.single('logo'), async (req, res) => {
  try {
    // only super admin can add department
    if (req.user.type !== userTypes.SUPER_ADMIN)
      throw new Error('Invalid Request')

    const record = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    }

    if (req.file) {
      const uniqueFilename = `departments/${uuid.v4()}-${req.file.originalname}`;
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: uniqueFilename, // Generate a unique key for each file
        Body: req.file.buffer,
      };

      const result = await s3.upload(params).promise();
      // Delete the local file after uploading to S3
      // fs.unlinkSync(req.file.path);
      record.logo = result.Location; // Save the S3 object key as the profilePicture field

      // Delete the previous profile picture from S3 if it exists
      // if (req.user.profilePicture) {
      //   const oldPicParams = {
      //     Bucket: process.env.AWS_BUCKET,
      //     Key: req.user.profilePicture,
      //   };

      //   await s3.deleteObject(oldPicParams).promise();
      // }
    }

    const department = new Department(record)

    await department.save()
    res.json({ department })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/edit', upload.single('logo'), async (req, res) => {
  try {
    if (!req.body.id) throw new Error('Department id is required')
    if (!mongoose.isValidObjectId(req.body.id))
      throw new Error('Department id is invalid')

    const department = await Department.findById(req.body.id)
    if (!department) throw new Error('Department does not exists')

    //check if logged in user is not super admin and that user
    //has access to its own department
    if (req.user.type !== userTypes.SUPER_ADMIN && req.user.departmentId.toString() !== req.body.id)
      throw new Error("Invalied request")

    const record = {
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    }
    if (req.user.type === userTypes.SUPER_ADMIN)
      record.name = req.body.name

    if (req.file) {
      const uniqueFilename = `departments/${uuid.v4()}-${req.file.originalname}`;
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: uniqueFilename, // Generate a unique key for each file
        Body: req.file.buffer,
      };

      const result = await s3.upload(params).promise();
      // Delete the local file after uploading to S3
      // fs.unlinkSync(req.file.path);
      record.logo = result.Location; // Save the S3 object key as the profilePicture field

      // Delete the previous profile picture from S3 if it exists
      // if (req.user.profilePicture) {
      //   const oldPicParams = {
      //     Bucket: process.env.AWS_BUCKET,
      //     Key: req.user.profilePicture,
      //   };

      //   await s3.deleteObject(oldPicParams).promise();
      // }
    }

    await Department.findByIdAndUpdate(req.body.id, record)

    res.json({ department: await Department.findById(req.body.id) })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get("/details/:deptId", async (req, res) => {
  try {

    if (!req.params.deptId)
      throw new Error("Department Id is Required");

    // if (req.user.type !== userTypes.SUPER_ADMIN && req.user.departmentId.toString() !== req.params.deptId)
    //   throw new Error("Invalied request")

    const department = await Department.findById(req.params.deptId);
    res.status(200).json({ department });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post('/delete', async (req, res) => {
  try {
    if (!req.body.id) throw new Error('Department id is required')
    if (!mongoose.isValidObjectId(req.body.id))
      throw new Error('Department id is invalid')

    //only super admin can delete department
    if (req.user.type !== userTypes.SUPER_ADMIN)
      throw new Error('Invalid Request')

    const department = await Department.findById(req.body.id)
    if (!department) throw new Error('Department does not exists')

    await Department.findByIdAndDelete(req.body.id)

    await Employee.deleteMany({ departmentId: req.body.id })
    await Rating.deleteMany({ departmentId: req.body.id })
    // await fs.rmdir(`content/${req.body.id}`, { recursive: true })
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const departments = await Department.find()

    res.status(200).json({ departments })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
