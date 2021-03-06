import * as path from 'path'
import { pageWith } from 'page-with'
import { executeGraphQLQuery } from './utils/executeGraphQLQuery'

function createRuntime() {
  return pageWith({
    example: path.resolve(__dirname, 'multipart-data.mocks.ts'),
  })
}

test('accepts a file from a GraphQL mutation', async () => {
  const runtime = await createRuntime()
  const UPLOAD_MUTATION = `
    mutation UploadFile(
      $file1: Upload
      $file2: Upload
      $plainText: String
      ) {
      multipart(
        file1: $file1
        file2: $file2
        plainText: $plainText
        ){
        file1
        file2
        plainText
      }
    }
  `
  const res = await executeGraphQLQuery(
    runtime.page,
    {
      query: UPLOAD_MUTATION,
      variables: {
        file1: null,
        file2: null,
        files: [null, null],
        plainText: 'text',
      },
    },
    {
      map: {
        '0': ['variables.file1', 'variables.files.0'],
        '1': ['variables.file2', 'variables.files.1'],
      },
      fileContents: ['file1 content', 'file2 content'],
    },
  )
  const body = await res.json()
  expect(res.status()).toEqual(200)
  expect(body).toEqual({
    data: {
      multipart: {
        file1: 'file1 content',
        file2: 'file2 content',
        files: ['file1 content', 'file2 content'],
        plainText: 'text',
      },
    },
  })
})
