
const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');


const { body, validationResult } = require('express-validator');

// Route1
// Get all the notes using: GET '/api/notes/fetchallnotes'. Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
});
 

// Route2
// Add a new Note using: POST '/api/notes/addnote'. Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid description').isLength({ min: 5 })
], async (req, res) => {

    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;
    const note = new Note({
        title,
        description,
        tag,
        user: req.user.id
    });

    const savedNote = await note.save();
    res.json(savedNote);
});


//  Route3
// Update an existing Note using: PUT '/api/notes/updatenote'. Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        error: "Note not found"
      });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        error: "Not Allowed"
      });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, description, tag },
      { new: true }
    );

    res.json(note);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// Rote4
// Delete an existing Note using: DELETE '/api/notes/deletenote'. Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        error: "Note not found"
      });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        error: "Not Allowed"
      });
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully" });
    res.json(note);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
   
});

module.exports = router;