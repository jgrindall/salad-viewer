

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

    const soundSequencer = {
        playSound: (sound) => {
            console.log('Playing sound', sound)
        },
        unmute: () => {},
        mute: () => {},
        preloadSound: (id, src, onLoaded) => {
            console.log('Preloading sound', id, src)
            onLoaded();
        }
    }
    
    const stats = {
        createAssessmentStats: (assessment) => {
            console.log('Creating assessment stats', assessment);
        }
    }

    return {
        assetManager: Salad.Factory.createAssetManager(assetsMap, resolver, soundSequencer),
        translator,
        soundSequencer,
        stats
    }
}

