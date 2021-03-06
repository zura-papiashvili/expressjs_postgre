const express = require('express');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(`${__dirname}../../../public/avatars/`));
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const { getById, getList, addItem, updateItem, patchItem, removeItem } = require('../services/users');

const router = express.Router();

const PREFIX = '/users';

router.get('/:id', async (req, res) => {
  const user = await getById(req.params.id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  res.send(user);
});

router.get('/', async (req, res) => {
  const users = await getList();

  res.send(users);
});

router.post('/', upload.single('avatar'), async (req, res) => {
  req.body.avatar = req.file.path;
  await addItem(req.body);

  res.sendStatus(201);
});

router.put('/:id', upload.single('avatar'), async (req, res) => {
  if (req.file.path) {
    req.body.avatar = req.file.path;
  }
  await updateItem(req.params.id, req.body);

  res.sendStatus(200);
});

router.patch('/:id', upload.single('avatar'), async (req, res) => {
  if (req.file.path) {
    req.body.avatar = req.file.path;
  }
  await patchItem(req.params.id, req.body);

  res.sendStatus(200);
});

router.delete('/:id', async (req, res) => {
  await removeItem(req.params.id);

  res.sendStatus(200);
});

module.exports = [PREFIX, router];
