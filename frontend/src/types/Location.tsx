
export type LocationRecord = {
  timestamp: string
  geography_position: string
  device_uuid: string
}

export type EcefRecord = {
  timestamp: string
  x_coordinate: number
  y_coordinate: number
  z_coordinate: number
  average: number
  device_uuid: string
}

export type ParsedLocationPoint = {
  timestamp: string
  device_uuid: string
  latitude: number
  longitude: number
}

export type Records = {
  locations: LocationRecord[]
  ecef: EcefRecord[]
}