export type LayerType = 'base' | 'map' | 'ui' | 'popup' | 'modal' | 'notification' | 'tooltip';

class LayerManager {
    private layers: Map<LayerType, number> = new Map();

    constructor() {
        this.initializeLayers();
    }

    private initializeLayers() {
        const layerOrder: LayerType[] = ['base', 'map', 'ui', 'popup', 'modal', 'notification', 'tooltip'];
        layerOrder.forEach((layer, index) => {
            this.layers.set(layer, (index + 1) * 1000);
        });
    }

    getZIndex(layerType: LayerType): number {
        return this.layers.get(layerType) || 0;
    }

    // 可以添加更多方法，如动态调整层级等
}

export const layerManager = new LayerManager();