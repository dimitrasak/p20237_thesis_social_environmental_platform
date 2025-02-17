using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Models;
using System.Linq;
using System.Collections.Generic;
using System.Reflection;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Find parameters of type IFormFile
        var fileParams = context.ApiDescription.ActionDescriptor.Parameters
            .Where(p => p.ParameterType == typeof(IFormFile)).ToList();

        if (fileParams.Any())
        {
            // Ensure that we set up the request body for multipart form-data
            operation.RequestBody = new OpenApiRequestBody
            {
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    {
                        "multipart/form-data",
                        new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = fileParams.ToDictionary(
                                    p => p.Name,
                                    p => new OpenApiSchema
                                    {
                                        Type = "string",
                                        Format = "binary"
                                    })
                            }
                        }
                    }
                }
            };
        }
    }
}
