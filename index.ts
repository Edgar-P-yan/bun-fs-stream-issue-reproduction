import * as fs from 'node:fs';

const fileSize = 16777231;
const fileName = '10000-measurements.txt';
const textDecoder = new TextDecoder();

// Buns default buffer size
const bufferSize = 65536;

// Bug: Souldv printed data from 100000th byte, but prints at the start
for await (const chunk of Bun.file(fileName).slice(100000, fileSize).stream()) {
  const text = textDecoder.decode(chunk.slice(0, 100));
  console.log(
    'Souldv printed data from 100000th byte, but prints at the start:'
  );
  console.log(text);
  break;
}

// Reading file with start = 0 works as expected
for await (const chunk of fs.createReadStream(fileName, {
  start: 0,
  end: fileSize,
})) {
  console.log('Reads file from the start as expected:');
  console.log(textDecoder.decode(chunk).slice(0, 100));
  break;
}

// Reading file with size < bufferSize works as expected
for await (const chunk of fs.createReadStream(fileName, {
  start: bufferSize - 1,
  end: fileSize,
})) {
  console.log('Reads file as expected if start < bufferSize:');
  console.log(textDecoder.decode(chunk).slice(0, 100));
  break;
}

// Bug: Reads data from start with size == bufferSize
for await (const chunk of fs.createReadStream(fileName, {
  start: bufferSize,
  end: fileSize,
})) {
  console.log('Reads data from the start because size == bufferSize');
  console.log(textDecoder.decode(chunk).slice(0, 100));
  break;
}

// Bug: Does not print anything, just hangs, if start > bufferSize
for await (const chunk of fs.createReadStream(fileName, {
  start: bufferSize + 1,
  end: fileSize,
})) {
  console.log('This will not get printed because size > bufferSize');
  console.log(textDecoder.decode(chunk).slice(0, 100));
  break;
}
