export default {
  pick: jest.fn(() => Promise.resolve([{
    uri: 'file://test.pdf',
    name: 'test.pdf',
    type: 'application/pdf',
    size: 1024
  }])),
  pickSingle: jest.fn(() => Promise.resolve({
    uri: 'file://test.pdf',
    name: 'test.pdf',
    type: 'application/pdf',
    size: 1024
  })),
  types: {
    pdf: 'application/pdf',
    allFiles: '*/*'
  }
};