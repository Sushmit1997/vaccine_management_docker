const express = require('express')
const multer = require('multer');

const router = express.Router()
const Vaccine = require('../models/vaccines')
const auth = require("../middleware/auth");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
})

const fileFilter = (req, file, cb) => {
  //reject a file

  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  }
  else {
    cb(null, false)
  }


};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

//Getting all vaccines
router.get('/', auth, async (req, res) => {
  try {
    const vaccines = await Vaccine.find({ createdBy: req.user._id })
    let mandatoryVaccines = vaccines.filter((vaccine) => vaccine.isMandatory).sort(compare)
    let nonMandatoryVaccines = vaccines.filter((vaccine) => !vaccine.isMandatory).sort(compare)
    let finalVaccines = [...mandatoryVaccines, ...nonMandatoryVaccines]
    res.status(200).json(finalVaccines)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})



//Adding a vaccine
router.post('/', auth, upload.single('image'), async (req, res) => {
  console.log(req.body)
    const vaccine = new Vaccine({
      name: req.body.name,
      company_email: req.body.company_email,
      company_contact: req.body.company_contact,
      number_of_dose: req.body.number_of_dose,
      image: req.file ? req.file.path : '',
      gender: req.body.gender,
      createdBy: req.user._id
    })
    try {
      const newVaccine = await vaccine.save()
      res.status(201).json(newVaccine)
    } catch (err) {
      console.error(err)
      res.status(400).json(err.message)
    }
  
  })

//Updating a vaccine

router.patch('/:id', auth, upload.single('image'), getVaccine, async (req, res) => {

  if(req.body.name !== null){
    res.vaccine.name = req.body.name
  }

  if(req.body.company_email !== null){
    res.vaccine.company_email = req.body.company_email
  }

  if(req.body.company_contact !== null){
    res.vaccine.company_contact = req.body.company_contact
  }

  if(req.body.number_of_dose !== null){
    res.vaccine.number_of_dose = req.body.number_of_dose
  }

  if (req.body.image !== null) {
    res.vaccine.image = req.file ? req.file.path : req.body.image
  }

  try {
    const updatedVaccine = await res.vaccine.save()
    res.status(201).json(updatedVaccine)
  } catch (err) {
    res.status(400).json(err.message)
  }
})

//Deleting a vaccine
router.delete('/:id', getVaccine, async (req, res) => {
  try {
    await res.vaccine.remove()
    await res.json({ message: 'Deleted successfully.' })
  } catch (err) {
    res.status(500).json({ message: 'failed to delete contact' })
  }
})

//Mandate a vaccine

router.get('/mandate/:id', getVaccine, (req, res) => {
  try {
    res.vaccine.isMandatory = !res.vaccine.isMandatory
    res.vaccine.save()
    res.status(200).json({ message: res.vaccine.isMandatory ? 'Vaccine removed from mandatory' : 'Vaccine removed from mandatory' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to add favourite.' })
  }
})


async function getVaccine(req, res, next) {
  let vaccine
  try {
    vaccine = await Vaccine.findById(req.params.id)
    if (vaccine === null) {
      return res.status(400).json({ message: 'Cannot find vaccine' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
  res.vaccine = vaccine
  next()
}

function compare(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}


  module.exports = router