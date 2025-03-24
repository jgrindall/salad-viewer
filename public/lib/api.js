

window.getApi = (assetsMap)=>{

    const resolver = {
        getResolverFn: (type) => {
            return (path) => {
                return path;
            }
        }
    }
    
    const translator = {
        translate: (key, options) => {
            return key
        }
    }

    const stats = {
        createAssessmentStats: (assessment) => {
            console.log('Creating assessment stats', assessment);
        }
    }

    const soundSequencer = Salad.Factory.getDefaultSoundSequencer();

    return {
        assetManager: Salad.Factory.createAssetManager(assetsMap, resolver, soundSequencer),
        translator,
        soundSequencer,
        stats
    }
}

