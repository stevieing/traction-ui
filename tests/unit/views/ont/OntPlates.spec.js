import OntPlates from '@/views/ont/OntPlates'
import OntPlate from '@/components/ont/OntPlate'
import { mount, localVue } from '../../testHelper'

describe('OntPlates.vue', () => {
  let wrapper, plates, platesData

  beforeEach(() => {
    platesData = [
      { id: 1, barcode: 'TRAC-1-1' },
      { id: 2, barcode: 'TRAC-1-2' }
    ]

    wrapper = mount(OntPlates, {
      localVue,
      stubs: {
        OntPlate: true
      },
      data() {
        return {
          plates: platesData
        }
      }
    })
    plates = wrapper.vm
  })

  it('will have fields', () => {
    expect(plates.fields).toEqual(['id', 'barcode', 'show_details'])
  })

  describe('components', () => {
    it('has a Alert component', () => {
      expect(wrapper.findComponent({ref: 'alert'})).toBeTruthy()
    })
  })

  it('will have a table', () => {
    expect(wrapper.find('table').exists()).toBeTruthy()
  })

  it('will have a table with plates', () => {
    expect(wrapper.find('tbody').findAll('tr').length).toEqual(platesData.length)
  })

  describe('Plate display button', () => {
    let button

    it('is present for each plate', () => {
      button = wrapper.find('#details-btn-1')
      expect(button.text()).toEqual('Show Plate')
    })

    it('has a OntPlate component on button click', () => {
      button = wrapper.find('#details-btn-1')
      button.trigger('click')
      expect(wrapper.findComponent(OntPlate).exists()).toBeTruthy()
    })
  })

  describe('#alert', () => {
    it('shows an alert', () => {
      plates.showAlert = jest.fn()
      plates.alert('message', 'type')
      expect(plates.showAlert).toBeCalledWith('message', 'type')
    })
  })
})