import SequencescapeTubesJson from '../../../../data/sequencescapeTubesWithSample'
import TractionSaphyrTubesWithRequestJson from '../../../../data/tractionSaphyrTubesWithRequest'
import TractionTubesWithLibrariesJson from '../../../../data/tubeWithLibrary'
import RequestsJson from '../../../../data/requests'

import Response from '@/api/Response'
import * as Actions from '@/store/traction/saphyr/actions'

describe('#getTractionTubesForBarcodes', () => {
  let commit, get, getters, barcodeString, failedResponse, emptyResponse

  beforeEach(() => {
    commit = jest.fn()
    get = jest.fn()
    getters = { 'tubeRequest': { 'get': get } }
    barcodeString = "TRAC-1"

    emptyResponse = { data: { data: [] }, status: 200, statusText: 'Success'}
    failedResponse = { data: { data: [] }, status: 500, statusText: 'Internal Server Error' }
  })

  it('successfully for samples', async () => {
    get.mockReturnValue(TractionSaphyrTubesWithRequestJson)

    let expectedResponse = new Response(TractionSaphyrTubesWithRequestJson)
    let expectedTubes = expectedResponse.deserialize.tubes

    let response = await Actions.getTractionTubesForBarcodes({ commit, getters }, barcodeString)

    expect(commit).toHaveBeenCalledWith("setTubes", expectedTubes)
    expect(response).toEqual(expectedResponse)
  })

  it('successfully for libraries', async () => {
    get.mockReturnValue(TractionTubesWithLibrariesJson)

    let expectedResponse = new Response(TractionTubesWithLibrariesJson)
    let expectedTubes = expectedResponse.deserialize.tubes

    let response = await Actions.getTractionTubesForBarcodes({ commit, getters }, barcodeString)

    expect(commit).toHaveBeenCalledWith("setTubes", expectedTubes)
    expect(response).toEqual(expectedResponse)
  })

  it('unsuccessfully', async () => {
    get.mockReturnValue(failedResponse)

    let expectedResponse = new Response(failedResponse)

    let response = await Actions.getTractionTubesForBarcodes({ commit, getters }, barcodeString)

    expect(commit).not.toHaveBeenCalled()
    expect(response).toEqual(expectedResponse)
  })

  it('when no tubes exist', async () => {
    get.mockReturnValue(emptyResponse)

    let expectedResponse = new Response(emptyResponse)

    let response = await Actions.getTractionTubesForBarcodes({ commit, getters }, barcodeString)

    expect(commit).not.toHaveBeenCalled()
    expect(response).toEqual(expectedResponse)
  })
})

describe('#exportSampleTubesIntoTraction', () => {
  let dispatch, create, getters, tubes

  beforeEach(() => {
    dispatch = jest.fn()
    create = jest.fn()
    getters = { 'requestsRequest': { 'create': create } }
    tubes = new Response(SequencescapeTubesJson).deserialize.tubes
  })

  it('successfully', async () => {
    create.mockReturnValue(RequestsJson)

    let response = await Actions.exportSampleTubesIntoTraction({ dispatch, getters }, tubes)

    let expectedResponse = new Response(RequestsJson)
    let expectedBarcodes = new Response(RequestsJson).deserialize.requests.map(s=> s.barcode).join('\n')

    expect(dispatch).toHaveBeenCalledWith("getTractionTubesForBarcodes", expectedBarcodes)
    expect(response).toEqual(expectedResponse)
  })

  it('unsuccessfully', async () => {
    let failedResponse = { status: 422, statusText: 'Unprocessable Entity', data: { errors: { name: ['error message'] }} }

    create.mockReturnValue(failedResponse)

    let response = await Actions.exportSampleTubesIntoTraction({ dispatch, getters }, tubes)

    let expectedResponse = new Response(failedResponse)

    expect(dispatch).not.toHaveBeenCalledWith("getTractionTubesForBarcodes")
    expect(response).toEqual(expectedResponse)
  })

})

describe('#sampleTubesJson', () => {

  it('will convert a deserialized response to the correct format', () => {
    let tubes = new Response(SequencescapeTubesJson).deserialize.tubes
    let json = Actions.sampleTubeJson(tubes)
    let tube = json[0]
    expect(tube.external_id).toBeDefined()
    expect(tube.external_id.includes('-')).toBeTruthy()
    expect(tube.external_study_id).toBeDefined()
    expect(tube.external_id.includes('-')).toBeTruthy()
    expect(tube.name).toBeDefined()
    expect(tube.species).toBeDefined()
  })
})

describe('#deleteLibraries', () => {
  let destroy, getters, libraryIds, failedResponse

  beforeEach(() => {
    destroy = jest.fn()
    getters = { 'libraryRequest': { 'destroy': destroy } }
    libraryIds = [1,2]

    failedResponse = { data: { data: [] }, status: 500, statusText: 'Internal Server Error' }
  })

  it('successfully', async () => {
    let mockResponse =  { data: {}, status: 204, statusText: "OK" }

    let promise = new Promise((resolve) => {
      resolve(mockResponse)
    })

    destroy.mockReturnValue([promise])

    let expectedResponse = new Response(mockResponse)
    let response = await Actions.deleteLibraries({ getters }, libraryIds)

    expect(response).toEqual([expectedResponse])
  })

  it('unsuccessfully', async () => {
    let promise = new Promise((reject) => {
      reject(failedResponse)
    })

    destroy.mockReturnValue([promise])

    let expectedResponse = new Response(failedResponse)
    let response = await Actions.deleteLibraries({ getters }, libraryIds)

    expect(response).toEqual([expectedResponse])
  })

})
