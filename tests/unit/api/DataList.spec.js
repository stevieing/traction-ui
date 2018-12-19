import Vue from 'vue'
import { mount, localVue } from '../testHelper'
import flushPromises from 'flush-promises'
import DataList from '@/api/DataList'

const listCmp = Vue.extend({
  name: 'listCmp',
  template: `
              <data-list resource="requests">
                <div slot-scope="{ data: requests }">
                  <ul>
                    <li v-for="request in requests" :key="request.id">
                      <h3>{{ request.id }}</h3>
                      <h3>{{ request.attributes.name }}</h3>
                    </li>
                  </ul>
                </div>
              </data-list>`,
  components: {
    DataList
  },
  data () {
    return {
    }
  }
})

describe('DataList', () => {

  let props, filters

  beforeEach(() => {
    props = {resource: 'requests'}
    filters = {type: 'long_read', state: 'pending'}
  })

  describe('filters', () => {

    let wrapper, dataList

    beforeEach(() => {
      wrapper = mount(DataList, { mocks: localVue, propsData: Object.assign(props, { filters: filters }) })
      dataList = wrapper.vm
    })

    it('creates a suitable prop', () => {
      expect(dataList.filters).toEqual(filters)
    })

    it('creates a suitable endpoint', () => {
      expect(dataList.endpoint).toEqual('requests?filter[type]=long_read&filter[state]=pending')
    })

  })

  describe('#load', () => {

    let wrapper, dataList

    beforeEach(() => {
      wrapper = mount(DataList, { mocks: localVue, propsData: Object.assign(props, { filters: filters }) })
      dataList = wrapper.vm
      dataList.api.get = jest.fn()
    })

    it('has data on execute', async () => {
      let data = { data: [{id: 1, attributes: {name: 'sample1', species: 'dog'}}]}
      let response = {status: 200, data: data }
      dataList.api.get.mockResolvedValue(response)
      dataList.load()
      await flushPromises()
      expect(dataList.data).toEqual(data)
    })

  })

  describe('scoped slots', () => {

    let wrapper, dataList, data, list, sampleRow

    beforeEach(() => {
      data = [{id: 1, attributes: {name: 'sample1', species: 'dog'}}, {id: 2, attributes: {name: 'sample2', species: 'cat'}}]
      wrapper = mount(listCmp)
      dataList = wrapper.vm
    })

    it('will render the sample data if they exist', () => {
      wrapper.find(DataList).vm.data = data
      list = wrapper.find('ul').findAll('li')
      expect(list.length).toEqual(2)
      sampleRow = list.at(0).findAll('h3')
      expect(sampleRow.at(0).text()).toEqual('1')
      expect(sampleRow.at(1).text()).toEqual('sample1')
    })

  })

})