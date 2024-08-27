async function forOfAwait(object, process){
    let array = []
    for await(const element of object){
        array.push(await process(element))
    }
    return array;
}

module.exports = {forOfAwait}