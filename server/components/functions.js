async function forOfAwait(object, process, execute = true){
    if(execute && typeof(object) !== 'undefined'){
        let array = []
        for await(const element of object){
            array.push(await process(element))
        }
        return array;
    }
    console.log('process not ran')
    return [];
}

module.exports = {forOfAwait}