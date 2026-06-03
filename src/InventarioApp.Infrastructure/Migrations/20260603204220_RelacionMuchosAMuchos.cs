using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventarioApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RelacionMuchosAMuchos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductoProveedor",
                columns: table => new
                {
                    ProductosID = table.Column<int>(type: "INTEGER", nullable: false),
                    ProveedoresID = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductoProveedor", x => new { x.ProductosID, x.ProveedoresID });
                    table.ForeignKey(
                        name: "FK_ProductoProveedor_Producto_ProductosID",
                        column: x => x.ProductosID,
                        principalTable: "Producto",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductoProveedor_Proveedor_ProveedoresID",
                        column: x => x.ProveedoresID,
                        principalTable: "Proveedor",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductoProveedor_ProveedoresID",
                table: "ProductoProveedor",
                column: "ProveedoresID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductoProveedor");
        }
    }
}
