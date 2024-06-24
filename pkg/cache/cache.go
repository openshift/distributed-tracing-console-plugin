package cache

import (
	"net/http/httputil"
	"sync"
)

type ProxiesMap = map[string]*httputil.ReverseProxy

type CacheManager struct {
	proxiesMap *ProxiesMap
	mutex      *sync.Mutex
}

func NewCacheManager() *CacheManager {
	return &CacheManager{
		proxiesMap: &ProxiesMap{},
		mutex:      &sync.Mutex{}}
}

func (manager *CacheManager) GetProxy(proxiesMapKey string) *httputil.ReverseProxy {
	manager.mutex.Lock()
	defer func() {
		manager.mutex.Unlock()
	}()
	return (*manager.proxiesMap)[proxiesMapKey]
}

func (manager *CacheManager) SetProxy(proxiesMapKey string, proxy *httputil.ReverseProxy) {
	manager.mutex.Lock()
	(*manager.proxiesMap)[proxiesMapKey] = proxy
	manager.mutex.Unlock()
}
