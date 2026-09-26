import type {
  GeoCoordinates,
  GeolocationError,
  GeolocationErrorCode,
} from "@/types/location.types";

export class GeolocationService {
  /**
   * Acquire real device coordinates via Browser Geolocation API.
   * Enforces zero-caching on initial acquisition (maximumAge: 0) and high accuracy.
   */
  async getCurrentCoordinates(
    options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    }
  ): Promise<GeoCoordinates> {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const err: GeolocationError = {
        code: "NOT_SUPPORTED",
        message: "Geolocation is not supported in this environment.",
        userFriendlyMessage:
          "Geolocation is not supported by your browser. Please enter your address manually.",
      };
      throw err;
    }

    return new Promise<GeoCoordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeoCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp || Date.now(),
          };
          resolve(coords);
        },
        (error) => {
          let code: GeolocationErrorCode = "UNKNOWN";
          let userFriendlyMessage =
            "Unable to detect your location. Please enter your address manually.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              code = "PERMISSION_DENIED";
              userFriendlyMessage =
                "Location permission was denied. You can enter your address manually.";
              break;
            case error.POSITION_UNAVAILABLE:
              code = "POSITION_UNAVAILABLE";
              userFriendlyMessage =
                "We couldn't determine your current location. Please try again or enter your address manually.";
              break;
            case error.TIMEOUT:
              code = "TIMEOUT";
              userFriendlyMessage =
                "Location detection took too long. Please try again or enter your address manually.";
              break;
            default:
              code = "UNKNOWN";
              userFriendlyMessage =
                "Unable to detect your location. Please enter your address manually.";
              break;
          }

          const geoError: GeolocationError = {
            code,
            message: error.message,
            userFriendlyMessage,
          };

          reject(geoError);
        },
        options
      );
    });
  }

  /**
   * Safe check for browser permission status where supported.
   */
  async checkPermissionStatus(): Promise<PermissionState | null> {
    if (typeof window === "undefined" || !navigator.permissions?.query) {
      return null;
    }

    try {
      const status = await navigator.permissions.query({ name: "geolocation" });
      return status.state;
    } catch {
      return null;
    }
  }

  /**
   * Validates if the GPS accuracy is acceptable or requires an advisory prompt.
   * If accuracy > 100 meters, advise the customer that the location may be approximate.
   */
  evaluateAccuracy(accuracy?: number): {
    isLowAccuracy: boolean;
    accuracyLabel: string;
    advice?: string;
  } {
    if (!accuracy || typeof accuracy !== "number") {
      return {
        isLowAccuracy: true,
        accuracyLabel: "Approximate",
        advice: "Device accuracy data is unavailable. Please verify your address details.",
      };
    }

    const rounded = Math.round(accuracy);

    if (accuracy > 100) {
      return {
        isLowAccuracy: true,
        accuracyLabel: `~${rounded}m accuracy`,
        advice: `Your device location may be approximate (within ~${rounded} metres). Please confirm your house and street details.`,
      };
    }

    return {
      isLowAccuracy: false,
      accuracyLabel: `~${rounded}m accuracy`,
    };
  }
}

export const geolocationService = new GeolocationService();
