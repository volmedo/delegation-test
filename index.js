import core from '@actions/core'
import { ed25519 } from '@ucanto/principal'
import * as Client from '@web3-storage/w3up-client'
import * as Proof from '@web3-storage/w3up-client/proof'
import * as Name from 'w3name'
import { filesFromPaths } from 'files-from-path'
import assert from 'node:assert'

const main = async () => {
  const source = core.getInput('source', { required: true })
  assert(source.endsWith('.tar.gz'), 'source must point to a .tar.gz file')

  const w3upPrivateKey = core.getInput('w3up-private-key', { required: true })
  const w3upProof = core.getInput('w3up-proof', { required: true })
  const w3namePrivateKey = core.getInput('w3name-private-key', { required: true })
  const w3nameRevision = core.getInput('w3name-revision', { required: true })

  const principal = ed25519.Signer.parse(w3upPrivateKey)
  const web3Storage = await Client.create({ principal })
  const proof = await Proof.parse(w3upProof)
  const space = await web3Storage.addSpace(proof)
  await web3Storage.setCurrentSpace(space.did())

  const name = await Name.from(Buffer.from(w3namePrivateKey, 'hex'))
  const revision = Name.Revision.decode(Buffer.from(w3nameRevision, 'hex'))

  const cid = await web3Storage.uploadFile((await filesFromPaths([source]))[0])
  console.log(`Uploaded as ${cid}`)
  core.setOutput('cid', cid.toString())

  const nextRevision = await Name.increment(revision, `/ipfs/${cid}`)
  await Name.publish(nextRevision, name.key)
  console.log('Updated name')
}

main().catch((err) => core.setFailed(err.message))
