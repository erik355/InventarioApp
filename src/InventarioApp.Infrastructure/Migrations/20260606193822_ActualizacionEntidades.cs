using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventarioApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ActualizacionEntidades : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Proveedor",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NombreDeEmpresa = table.Column<string>(type: "TEXT", nullable: true),
                    CUIT = table.Column<long>(type: "INTEGER", nullable: false),
                    Rubro = table.Column<string>(type: "TEXT", nullable: true),
                    Telefono = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proveedor", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Producto",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: true),
                    StockMinimo = table.Column<int>(type: "INTEGER", nullable: false),
                    Stock = table.Column<int>(type: "INTEGER", nullable: false),
                    PrecioVenta = table.Column<double>(type: "REAL", nullable: false),
                    ProveedorID = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Producto_Proveedor_ProveedorID",
                        column: x => x.ProveedorID,
                        principalTable: "Proveedor",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "MovimientoStock",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProductoID = table.Column<int>(type: "INTEGER", nullable: false),
                    ProveedorID = table.Column<int>(type: "INTEGER", nullable: true),
                    Cantidad = table.Column<int>(type: "INTEGER", nullable: false),
                    PrecioCompra = table.Column<double>(type: "REAL", nullable: false),
                    FechaMovimiento = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notas = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientoStock", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MovimientoStock_Producto_ProductoID",
                        column: x => x.ProductoID,
                        principalTable: "Producto",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimientoStock_Proveedor_ProveedorID",
                        column: x => x.ProveedorID,
                        principalTable: "Proveedor",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "OrdenDeCompra",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Fecha = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    ProveedorId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProductoId = table.Column<int>(type: "INTEGER", nullable: false),
                    Cantidad = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdenDeCompra", x => x.ID);
                    table.ForeignKey(
                        name: "FK_OrdenDeCompra_Producto_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Producto",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdenDeCompra_Proveedor_ProveedorId",
                        column: x => x.ProveedorId,
                        principalTable: "Proveedor",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientoStock_ProductoID",
                table: "MovimientoStock",
                column: "ProductoID");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientoStock_ProveedorID",
                table: "MovimientoStock",
                column: "ProveedorID");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenDeCompra_ProductoId",
                table: "OrdenDeCompra",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenDeCompra_ProveedorId",
                table: "OrdenDeCompra",
                column: "ProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_ProveedorID",
                table: "Producto",
                column: "ProveedorID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovimientoStock");

            migrationBuilder.DropTable(
                name: "OrdenDeCompra");

            migrationBuilder.DropTable(
                name: "Producto");

            migrationBuilder.DropTable(
                name: "Proveedor");
        }
    }
}
