import Response from '@/api/Response'
import deserialize from '@/api/JsonApi'

describe('Response', () => {

  let mockResponse, response

  describe('basic', () => {

    describe('Success', () => {
      beforeEach(() => {
        mockResponse =  {
          data: {
            data: [
               { id: 1, type: "requests", attributes: { name: "testname1", species: "testspecies1" }},
               { id: 2, type: "requests", attributes: { name: "testname2", species: "testspecies2" }}
            ]
          },
          status: 200,
          statusText: "OK"
        },
        response = new Response(mockResponse)
      })

      it('has a status', () => {
        expect(response.status).toEqual(200)
      })

      it('has a status text', () => {
        expect(response.statusText).toEqual('OK')
      })

      it('has some attributes', () => {
        let attributes = response.data
        expect(attributes.requests.length).toEqual(2)
        let request = attributes.requests[0]
        expect(request.name).toEqual('testname1')
        expect(request.species).toEqual('testspecies1')
      })

      it('flagged as successful', () => {
        expect(response.successful).toBeTruthy()
      })

      it('has no errors', () => {
        expect(response.errors).toEqual({})
      })

      it('data returns serialized object', () => {
        let serializedObj = deserialize(mockResponse.data)
        expect(response.data).toEqual(serializedObj)
      })
    })

  })

  describe('Failure', () => {

    beforeEach(() => {
      mockResponse = {
        data: {
          errors: {
            name: ['name error message 1'],
            species: ['species error message 2.1', 'species error message 2.2']
          }
        },
        status: 422,
        statusText: "Unprocessible entity"
      },
      response = new Response(mockResponse, 'requests')
    })

    it('has a status', () => {
      expect(response.status).toEqual(422)
    })

    it('has some errors', () => {
      let message = 'name name error message 1, species species error message 2.1, species species error message 2.2'
      expect(response.errors).toEqual({ message: message})
    })

    it('not flagged as successful', () => {
      expect(response.successful).toBeFalsy()
    })

    it('has no data', () => {
      expect(response.data).toEqual({})
    })

  })


})
