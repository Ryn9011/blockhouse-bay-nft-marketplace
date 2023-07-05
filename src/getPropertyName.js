import datajson from '../src/final-manifest.json';
import datajsonEx from '../src/exc-manifest.json';

const GetPropertyNames = (meta, pid) => {
  let data = pid >= 501 ? datajsonEx : datajson;

  const url = meta.config.url
 
  const parts = url.split('/');

  const targetId = parts.slice(3).join('/');      
    function getPathNameById(id) {
      for (const [pathKey, { id: pathId }] of Object.entries(data.paths)) {
        if (id === pathId) {
          return pathKey;
        }
      }
      return null;
    }

    // const targetId = "NkPscRzwlee3476uYweOFTEXvLM8Bnt_A0T2QypL6go";
    const targetPathName = getPathNameById(targetId);

    if (targetPathName) {
      var splitName = targetPathName.split('.');      
      var name = splitName.slice(0, 1).join('.')

      return (name)
    } else {
      console.log(`No path name found for id ${targetId}.`);
    }
  
}

export default GetPropertyNames;
