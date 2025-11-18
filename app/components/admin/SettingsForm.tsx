"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Spinner,
  Divider,
} from "@mond-design-system/theme";
import { Input, Select, Switch, Radio } from "@mond-design-system/theme/client";
import type { SiteSettings } from "@/app/types";
import { updateSettings } from "@/app/actions/settings";
import { uploadFile } from "@/app/utils/storage";
import { useToast } from "@/app/providers/ToastProvider";

interface SettingsFormProps {
  settings: SiteSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { showSuccess, showError } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [paypalMode, setPaypalMode] = useState<"sandbox" | "production">(
    settings.paypalMode || "sandbox",
  );
  const [stickyHeader, setStickyHeader] = useState(
    settings.stickyHeader ?? false,
  );
  const [siteNameSize, setSiteNameSize] = useState<string>(
    settings.siteNameSize || "md",
  );

  // Logo state
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [logoSize, setLogoSize] = useState<string>(
    settings.logoSize || "2xl",
  );
  const [logoInputType, setLogoInputType] = useState<"url" | "upload">("url");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Favicon state
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || "");
  const [faviconInputType, setFaviconInputType] = useState<"url" | "upload">(
    "url",
  );
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);

    setIsSaving(false);

    if (result.success) {
      showSuccess("Settings saved successfully!");
    } else {
      showError(result.error || "Failed to save settings");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box>
        <Box
          marginBottom="4"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Heading level={1} size="3xl">
              Site Settings
            </Heading>
            <Text variant="body" semantic="secondary">
              Manage your site configuration and integrations
            </Text>
          </Box>
          <Button type="submit" variant="primary" loading={isSaving}>
            Save Settings
          </Button>
        </Box>

        <Box display="flex" flexDirection="column" gap="md">
          <Box>
            <Input
              id="siteName"
              name="siteName"
              type="text"
              label="Site Name"
              defaultValue={settings.siteName}
              required
            />
          </Box>
          <Box>
            <Select
              id="siteNameSize"
              name="siteNameSize"
              label="Site Name Size"
              value={siteNameSize}
              onChange={(value) => setSiteNameSize(value)}
              options={[
                { value: "xs", label: "Extra Small" },
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
                { value: "xl", label: "Extra Large" },
                { value: "2xl", label: "2X Large" },
                { value: "3xl", label: "3X Large" },
                { value: "4xl", label: "4X Large" },
                { value: "5xl", label: "5X Large" },
                { value: "6xl", label: "6X Large" },
              ]}
              helperText="Size of the site name displayed in the header"
            />
          </Box>

          <Box>
            <Input
              id="siteDescription"
              name="siteDescription"
              type="text"
              label="Site Description"
              defaultValue={settings.siteDescription}
            />
          </Box>

          {/* <Box> */}
          {/*   <Input */}
          {/*     id="contactEmail" */}
          {/*     name="contactEmail" */}
          {/*     type="email" */}
          {/*     label="Contact Email" */}
          {/*     defaultValue={settings.contactEmail} */}
          {/*   /> */}
          {/* </Box> */}

          <Box>
            <Box>
              <Text>Site Logos</Text>
            </Box>

            <Box
              display="flex"
              gap="lg"
              border="default"
              alignItems="center"
              justifyContent="space-around"
              padding="2"
            >
              {/* Logo */}
              <Box>
                <Box as="label" id="logo-input-type-label">
                  <Text semantic="secondary">Logo</Text>
                </Box>
                <Box
                  display="flex"
                  gap="md"
                  marginTop="2"
                  marginBottom="3"
                  role="radiogroup"
                  aria-labelledby="logo-input-type-label"
                >
                  <Box display="flex" alignItems="center" gap="sm">
                    <Radio
                      id="logo-input-url"
                      name="logo-input-type"
                      value="url"
                      checked={logoInputType === "url"}
                      onChange={() => setLogoInputType("url")}
                      aria-label="Logo URL"
                    />
                    <Text variant="body-sm">Image URL</Text>
                  </Box>
                  <Box display="flex" alignItems="center" gap="sm">
                    <Radio
                      id="logo-input-upload"
                      name="logo-input-type"
                      value="upload"
                      checked={logoInputType === "upload"}
                      onChange={() => setLogoInputType("upload")}
                      aria-label="Upload Logo"
                    />
                    <Text variant="body-sm">Upload Image</Text>
                  </Box>
                </Box>

                <Box display="flex">
                  <Box display="flex" gap="md">
                    {logoInputType === "url" ? (
                      <Box>
                        <Input
                          key="logo-url-input"
                          id="logoUrl"
                          name="logoUrl"
                          label="Logo URL"
                          type="text"
                          placeholder="https://example.com/logo.png"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          helperText="URL to your site logo image"
                        />
                      </Box>
                    ) : (
                      <Box>
                        <Input
                          key="logo-file-input"
                          id="logo-upload"
                          label="Upload Logo File"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setIsUploadingLogo(true);
                                const path = `settings/logo-${crypto.randomUUID()}-${file.name}`;
                                const downloadURL = await uploadFile(
                                  path,
                                  file,
                                );
                                setLogoUrl(downloadURL);
                                showSuccess("Logo uploaded successfully");
                              } catch (error) {
                                console.error("Error uploading logo:", error);
                                showError(
                                  "Failed to upload logo. Please try again.",
                                );
                              } finally {
                                setIsUploadingLogo(false);
                              }
                            }
                          }}
                          disabled={isUploadingLogo}
                        />
                        {isUploadingLogo && (
                          <Box marginTop="1">
                            <Spinner size="sm" label="Uploading logo..." />
                          </Box>
                        )}
                        <input type="hidden" name="logoUrl" value={logoUrl} />
                      </Box>
                    )}

                    {/* Logo Preview */}
                    {logoUrl && (
                      <Box display="flex" flexDirection="column">
                        <Text variant="body-sm" semantic="secondary">
                          Preview:
                        </Text>
                        <Box>
                          <img
                            src={logoUrl}
                            alt="Logo preview"
                            style={{
                              maxWidth: "32px",
                              maxHeight: "32px",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider orientation="vertical" />

              <Box>
                {/* Favicon */}
                <Box>
                  <Box as="label" id="favicon-input-type-label">
                    <Text semantic="secondary">Favicon</Text>
                  </Box>
                  <Box
                    display="flex"
                    gap="md"
                    marginTop="2"
                    marginBottom="3"
                    role="radiogroup"
                    aria-labelledby="favicon-input-type-label"
                  >
                    <Box display="flex" alignItems="center" gap="sm">
                      <Radio
                        id="favicon-input-url"
                        name="favicon-input-type"
                        value="url"
                        checked={faviconInputType === "url"}
                        onChange={() => setFaviconInputType("url")}
                        aria-label="Favicon URL"
                      />
                      <Text variant="body-sm">Image URL</Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="sm">
                      <Radio
                        id="favicon-input-upload"
                        name="favicon-input-type"
                        value="upload"
                        checked={faviconInputType === "upload"}
                        onChange={() => setFaviconInputType("upload")}
                        aria-label="Upload Favicon"
                      />
                      <Text variant="body-sm">Upload Image</Text>
                    </Box>
                  </Box>

                  <Box display="flex" gap="md" alignItems="flex-start">
                    <Box>
                      {faviconInputType === "url" ? (
                        <Box>
                          <Input
                            key="favicon-url-input"
                            id="faviconUrl"
                            name="faviconUrl"
                            label="Favicon URL"
                            type="text"
                            placeholder="https://example.com/favicon.ico"
                            value={faviconUrl}
                            onChange={(e) => setFaviconUrl(e.target.value)}
                            helperText="URL to your site favicon (.ico, .png, or .svg)"
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Input
                            key="favicon-file-input"
                            id="favicon-upload"
                            label="Upload Favicon File"
                            type="file"
                            accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setIsUploadingFavicon(true);
                                  const path = `settings/favicon-${crypto.randomUUID()}-${file.name}`;
                                  const downloadURL = await uploadFile(
                                    path,
                                    file,
                                  );
                                  setFaviconUrl(downloadURL);
                                  showSuccess("Favicon uploaded successfully");
                                } catch (error) {
                                  console.error(
                                    "Error uploading favicon:",
                                    error,
                                  );
                                  showError(
                                    "Failed to upload favicon. Please try again.",
                                  );
                                } finally {
                                  setIsUploadingFavicon(false);
                                }
                              }
                            }}
                            disabled={isUploadingFavicon}
                          />
                          {isUploadingFavicon && (
                            <Box marginTop="1">
                              <Spinner size="sm" label="Uploading favicon..." />
                            </Box>
                          )}
                          <input
                            type="hidden"
                            name="faviconUrl"
                            value={faviconUrl}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Favicon Preview */}
                    {faviconUrl && (
                      <Box display="flex" flexDirection="column">
                        <Text variant="body-sm" semantic="secondary">
                          Preview:
                        </Text>
                        <img
                          src={faviconUrl}
                          alt="Favicon preview"
                          style={{
                            width: "32px",
                            height: "32px",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Select
              id="logoSize"
              name="logoSize"
              label="Logo Size"
              value={logoSize}
              onChange={(value) => setLogoSize(value)}
              options={[
                { value: "xs", label: "Extra Small" },
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
                { value: "xl", label: "Extra Large" },
                { value: "2xl", label: "2X Large" },
              ]}
              helperText="Size of the logo displayed in the header"
            />
          </Box>

          <Box display="flex" flexDirection="column" gap="xxs">
            <Box display="flex" alignItems="center" gap="sm">
              <label htmlFor="stickyHeader">
                <Text variant="body">Sticky Header</Text>
              </label>
            </Box>
            <Box display="flex" gap="md">
              <Switch
                id="stickyHeader"
                checked={stickyHeader}
                onChange={(e) => setStickyHeader(e.target.checked)}
              />
              <Text variant="body-sm" semantic="secondary">
                Keep the header fixed at the top when scrolling
              </Text>
              <input
                type="hidden"
                name="stickyHeader"
                value={stickyHeader.toString()}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Integrations */}
      {/* <Box marginBottom="8"> */}
      {/*   <Box marginBottom="4"> */}
      {/*     <Heading level={2} size="2xl"> */}
      {/*       Integrations */}
      {/*     </Heading> */}
      {/*   </Box> */}
      {/**/}
      {/*   <Box display="flex" flexDirection="column" gap="md"> */}
      {/*     <Box> */}
      {/*       <Input */}
      {/*         id="googleAnalyticsId" */}
      {/*         name="googleAnalyticsId" */}
      {/*         type="text" */}
      {/*         label="Google Analytics ID" */}
      {/*         defaultValue={settings.googleAnalyticsId || ""} */}
      {/*         placeholder="G-XXXXXXXXXX" */}
      {/*         helperText="Optional: Enter your Google Analytics measurement ID" */}
      {/*       /> */}
      {/*     </Box> */}
      {/**/}
      {/*     <Box> */}
      {/*       <Input */}
      {/*         id="paypalClientId" */}
      {/*         name="paypalClientId" */}
      {/*         type="text" */}
      {/*         label="PayPal Client ID" */}
      {/*         defaultValue={settings.paypalClientId || ""} */}
      {/*         helperText="Optional: For PayPal donation integration" */}
      {/*       /> */}
      {/*     </Box> */}
      {/**/}
      {/*     <Box> */}
      {/*       <Select */}
      {/*         id="paypalMode" */}
      {/*         label="PayPal Mode" */}
      {/*         value={paypalMode} */}
      {/*         onChange={(value) => */}
      {/*           setPaypalMode(value as "sandbox" | "production") */}
      {/*         } */}
      {/*         options={[ */}
      {/*           { value: "sandbox", label: "Sandbox (Testing)" }, */}
      {/*           { value: "production", label: "Production (Live)" }, */}
      {/*         ]} */}
      {/*         helperText="Use sandbox mode for testing, production for live transactions" */}
      {/*       /> */}
      {/*       <input type="hidden" name="paypalMode" value={paypalMode} /> */}
      {/*     </Box> */}
      {/*   </Box> */}
      {/* </Box> */}
    </form>
  );
}
