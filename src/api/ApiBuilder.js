import Vue from 'vue'
import Request from '@/api/Request'

const buildComponent = (component, props) => {
  let cmp = Vue.extend(component)
  return new cmp({ propsData: props})
}

const build = (config, environment) => {
  return Object.keys(config).reduce((result, key) => {
    const {resources, ...props} = config[key]
    result[key] = buildResources(resources, apiProps(key, props, environment))
    return result
  }, {})
}

const buildResources = (resources, props) => {
  return Object.keys(resources).reduce((result, key) => {
    result[key] = buildComponent(Request, Object.assign(props, {resource: key, ...resources[key]}))
    return result
  }, {})
}

const apiProps = (api, props, environment) => {
  const baseURL = environment[`VUE_APP_${api.toUpperCase()}_BASE_URL`]
  return { baseURL: baseURL, ...props}
}

export {
  buildComponent,
  build
}

export default build
