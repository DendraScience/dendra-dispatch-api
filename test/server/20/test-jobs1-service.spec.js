/**
 * Tests for dispatch service
 */

const servicePath = 'test-jobs1'

describe(`Service ${servicePath}`, function() {
  const cleanup = async () => {
    await coll.test_jobs1.remove()
  }

  before(async function() {
    await cleanup()
  })

  after(async function() {
    return cleanup()
  })

  describe('#create()', function() {
    it('should create without error', function() {
      return clients.guest
        .service(servicePath)
        .create({
          _id: 'aaa-bbb-ccc',
          params: {
            some_param: 'some_param_value'
          },
          spec: {
            some_spec: 'some_spec_value'
          }
        })
        .then(doc => {
          expect(doc).to.have.property('_id', 'aaa-bbb-ccc')
          expect(doc).to.have.nested.property(
            'params.some_param',
            'some_param_value'
          )
          expect(doc).to.have.nested.property(
            'spec.some_spec',
            'some_spec_value'
          )
        })
    })
  })

  describe('#get()', function() {
    it('should get without error', function() {
      return clients.guest
        .service(servicePath)
        .get('aaa-bbb-ccc')
        .then(doc => {
          expect(doc).to.have.property('_id', 'aaa-bbb-ccc')
          expect(doc).to.have.nested.property(
            'params.some_param',
            'some_param_value'
          )
          expect(doc).to.have.nested.property(
            'spec.some_spec',
            'some_spec_value'
          )
        })
    })
  })

  describe('#find()', function() {
    it('should find without error', function() {
      return clients.guest
        .service(servicePath)
        .find({})
        .then(res => {
          expect(res)
            .to.have.property('data')
            .lengthOf(1)
        })
    })
  })

  describe('#remove()', function() {
    it('should remove without error', function() {
      return clients.guest
        .service(servicePath)
        .remove('aaa-bbb-ccc')
        .then(doc => {
          expect(doc).to.have.property('_id')
        })
    })
  })
})
