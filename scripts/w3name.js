import * as Name from "w3name"

const name = await Name.create()
const value = "/ipfs/empty"
const revision = await Name.v0(name, value)

await Name.publish(revision, name.key)

console.log("name", name.toString())
console.log("w3name-private-key")
console.log(name.key.bytes.toString("hex"))
console.log("w3name-revision")
console.log(Name.Revision.encode(revision).toString("hex"))
