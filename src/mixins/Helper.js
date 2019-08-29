/**
 * A helper mixin to store commonly used functionality
 */
import printJob from '@/api/PrintJobRequests'
import * as consts from '@/consts/consts'
import handlePromise from '@/api/PromiseHelper'

export default {
  name: 'Helper',
  methods: {
    /**
     * Toggle the alert (of type provided) on the page with the provided message
     * @param {*} message the message to show in the alert box
     * @param {string} type the variant (colour) of the alert
     */
    showAlert(message, type) {
      return this.$refs.alert.show(message, type)
    },
    /**
     * Send message to the console - only when not in production
     * @param {*} message the message to log
     */
    log(message) {
      if (process.env !== 'production') {
        console.log(message)
      }
    },
    async handlePrintLabel(printerName) {
      let response = await printJob(printerName, this.selected)

      this.showAlert(response.successful ? consts.MESSAGE_SUCCESS_PRINTER : response.errors.message)
    },
    async getMaterial(materialType) {
      this.log(`getMaterial(${materialType})`)

      let promise = null
      if (materialType === consts.MAT_TYPE_REQUESTS) {
        promise = this.tractionSaphyrRequestsRequest.get()
      } else if (materialType === consts.MAT_TYPE_LIBRARIES) {
        promise = this.tractionSaphyrLibraryRequest.get()
      } else {
        throw Error(consts.MESSAGE_ERROR_INTERNAL)
      }
      let response = await handlePromise(promise)
      this.log(response)

      if (response.successful) {
        let materials = eval(`response.deserialize.${materialType}`)

        this.$store.commit(`add${this.capitalizeFirstLetter(materialType)}`, materials)

        // Pre-filter the samples to those provided as a query paramater
        if (typeof this.$route.query.barcode !== 'undefined' &&
          this.$route.query.barcode !== '') {

          let preFilteredBarcodes = []
          if (typeof this.$route.query.barcode === 'string') {
            preFilteredBarcodes.push(this.$route.query.barcode)
          } else {
            preFilteredBarcodes.push(...this.$route.query.barcode)
          }
          this.log(`preFilteredBarcodes: ${preFilteredBarcodes}`)

          // There might be barcodes in the query which are invalid, remove these and alert the user
          let barcodesOfMaterials = materials.map(sample => sample.barcode)
          let invalidBarcodes = preFilteredBarcodes.filter(
            barcode => !barcodesOfMaterials.includes(barcode))

          if (invalidBarcodes.length > 0) {
            this.showAlert(consts.MESSAGE_ERROR_INVALID_BARCODES.concat(invalidBarcodes.join(', ')),
              'danger')
          }

          this.preFilteredSamples = materials.filter(
            sample => preFilteredBarcodes.includes(sample.barcode))

          return this.preFilteredSamples
        }
        return materials
      } else {
        this.showAlert(response.errors.message)
        return []
      }
    },
    /**
     * https: //stackoverflow.com/a/1026087
     * @param {*} string the string to capitalize
     */
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  },
  computed: {
    tractionSaphyrRequestsRequest() {
      return this.api.traction.saphyr.requests
    },
    tractionSaphyrLibraryRequest() {
      return this.api.traction.saphyr.libraries
    },
  }
}
