import type { SRDFeature } from '@/types/srd'
import { loadFeatures } from '@/utils/dataLoader'

export async function getFeaturesByClassAndLevel(classIndex: string, level: number = 1): Promise<SRDFeature[]> {
  const allFeatures = await loadFeatures()
  
  return allFeatures.filter(feature => 
    feature.class.index === classIndex && 
    feature.level <= level
  )
}

export async function getAllFeaturesByClass(classIndex: string): Promise<SRDFeature[]> {
  const allFeatures = await loadFeatures()
  
  return allFeatures.filter(feature => 
    feature.class.index === classIndex
  )
}

export function getFeatureDescriptionFromSRD(feature: SRDFeature): string {
  return feature.desc.join(' ')
}
