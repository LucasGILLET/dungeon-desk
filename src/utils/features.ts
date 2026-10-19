import type { SRDFeature } from '@/types/srd'
import { loadFeatures } from '@/utils/dataLoader'

export async function getAllFeaturesByClass(classIndex: string): Promise<SRDFeature[]> {
  const allFeatures = await loadFeatures()
  
  return allFeatures.filter(feature => 
    feature.class.index === classIndex
  )
}
