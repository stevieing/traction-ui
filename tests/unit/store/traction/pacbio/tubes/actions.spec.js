import { Data } from '../../../../testHelper'
import Response from '@/api/Response'
import * as Actions from '@/store/traction/pacbio/tubes/actions'

describe('#getTractionTubesForBarcodes', () => {
  let commit, get, getters, barcodeList, failedResponse, emptyResponse

  beforeEach(() => {
    commit = jest.fn()
    get = jest.fn()
    getters = { 'tubeRequest': { 'get': get } }
    barcodeList = ["TRAC-1"]

    emptyResponse = { data: { data: [] }, status: 200, statusText: 'Success'}
    failedResponse = { data: { data: [] }, status: 500, statusText: 'Internal Server Error' }
  })

  it('successfully for samples', async () => {
    get.mockReturnValue(Data.TractionPacbioTubesWithRequest)

    let expectedResponse = new Response(Data.TractionPacbioTubesWithRequest)
    let expectedTubes = expectedResponse.deserialize.tubes

    let response = await Actions.getTractionTubesForBarcodes({ commit, getters }, barcodeList)

    expect(commit).toHaveBeenCalledWith("setTubes", expectedTubes)
    expect(response).toEqual(expectedResponse)
  })

  it('successfully for libraries', async () => {
    get.mockReturnValue(Data.TubeWithLibrary)

    let expectedResponse = new Response(Data.TubeWithLibrary)
    let expectedTubes = expectedResponse.deserialize.tubes

    let response = await Actions.getTractionTubesForBarcodes({ commit, getters }, barcodeList)

    expect(commit).toHaveBeenCalledWith("setTubes", expectedTubes)
    expect(response).toEqual(expectedResponse)
  })

  it('unsuccessfully', async () => {
    get.mockReturnValue(failedResponse)

    let expectedResponse = new Response(failedResponse)

    let response = await Actions.getTractionTubesForBarcodes({ commit, getters }, barcodeList)

    expect(commit).not.toHaveBeenCalled()
    expect(response).toEqual(expectedResponse)
  })

  it('when no tubes exist', async () => {
    get.mockReturnValue(emptyResponse)

    let expectedResponse = new Response(emptyResponse)

    let response = await Actions.getTractionTubesForBarcodes({ commit, getters }, barcodeList)

    expect(commit).not.toHaveBeenCalled()
    expect(response).toEqual(expectedResponse)
  })
})

describe('#exportSampleExtractionTubesIntoTraction', () => {
  let dispatch, create, getters, tubes

  beforeEach(() => {
    create = jest.fn()
    getters = { 'requestsRequest': { 'create': create } }
    tubes = new Response(Data.SampleExtractionTubesWithSample).deserialize.assets
  })

  it('successfully', async () => {
    let expectedResponse = new Response(Data.TractionPacbioTubesWithRequest)
    create.mockReturnValue(Data.TractionPacbioTubesWithRequest)

    let response = await Actions.exportSampleExtractionTubesIntoTraction({ getters }, tubes)
    expect(response).toEqual(expectedResponse)
  })

  it('unsuccessfully', async () => {
    let failedResponse = { status: 422, statusText: 'Unprocessable Entity', data: { errors: { name: ['error message'] }} }
    let expectedResponse = new Response(failedResponse)

    create.mockReturnValue(failedResponse)

    let response = await Actions.exportSampleExtractionTubesIntoTraction({ dispatch, getters }, tubes)
    expect(response).toEqual(expectedResponse)
  })
})

describe('#sampleExtractionTubeJson', () => {

  it('will convert a deserialized response to the correct format for a pacbio request', () => {
    let tubes = new Response(Data.SampleExtractionTubesWithSample).deserialize.assets
    let json = Actions.sampleExtractionTubeJson(tubes)
    let tube = json[0]
    expect(tube.external_id).toBeDefined()
    expect(tube.external_id.includes('-')).toBeTruthy()
    expect(tube.external_study_id).toBeDefined()
    expect(tube.external_study_id.includes('-')).toBeTruthy()
    expect(tube.name).toBeDefined()
    expect(tube.species).toBeDefined()
    expect(tube.library_type).toBeDefined()
    expect(tube.estimate_of_gb_required).toBeDefined()
    expect(tube.number_of_smrt_cells).toBeDefined()
    expect(tube.cost_code).toBeDefined()
  })
})

// TODO: we really need factories rather than building payloads manually
describe('#createLibrariesInTraction', () => {
  let create, getters, libraries, payload

  beforeEach(() => {
    create = jest.fn()
    getters = { 'libraryRequest': { 'create': create } }
    libraries = { libraries: [
      { volume: 1.0, concentration: 1.0, libraryKitBarcode: "LK12345", fragmentSize: 100, samples: [{id: 1}] },
      { volume: 1.0, concentration: 1.0, libraryKitBarcode: "LK12345", fragmentSize: 100, samples: [{id: 2}] }
    ]}
    payload = [
      {concentration: 1, fragment_size: 100, library_kit_barcode: "LK12345", relationships: {requests: {data: [{id: 1, relationships: {tag: { data: {id: 1}}}, type: "requests"}]}}, volume: 1}, 
      {concentration: 1, fragment_size: 100, library_kit_barcode: "LK12345", relationships: {requests: {data: [{id: 2, relationships: {tag: { data: {id: 1}}}, type: "requests"}]}}, volume: 1}
    ]
  })

  it('successfully', async () => {
    let expectedResponse = new Response(Data.PacbioTubeWithLibrary)
    create.mockReturnValue(Data.PacbioTubeWithLibrary)

    let response = await Actions.createLibrariesInTraction({ getters }, libraries)
    expect(response).toEqual(expectedResponse)
    expect(create).toBeCalledWith({data: { type: 'libraries', attributes: { libraries: payload}}})
  })

  it('unsuccessfully', async () => {
    let failedResponse = { status: 422, statusText: 'Unprocessable Entity', data: { errors: { name: ['error message'] }} }
    let expectedResponse = new Response(failedResponse)

    create.mockReturnValue(failedResponse)

    let response = await Actions.createLibrariesInTraction({ getters }, libraries)
    expect(response).toEqual(expectedResponse)
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
